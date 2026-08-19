import { computed, inject } from '@angular/core';
// rxMethod(NgRx Signals): crea un "método reactivo". Cuando lo invocas, sus argumentos
// entran como un Observable al que le aplicas operadores RxJS (aquí: switchMap).
import { rxMethod } from '@ngrx/signals/rxjs-interop';
// Bloques "features" con los que se construye un signalStore:
// - signalStore():   crea el store final (un Injectable que el componente inyecta con `providers`).
// - withState:       define el estado inicial (los signals que guardan los datos).
// - withComputed:    define selectores DERIVADOS (computed) del estado.
// - withMethods:     define las acciones/métodos del store.
// patchState: función que actualiza el estado de forma segura (equivale a signal.set/update).
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
// Operadores RxJS:
// - tap       -> efecto secundario (aquí: actualizar el estado) sin alterar el flujo de datos.
// - switchMap: cancela una petición en curso si llega otra nueva (evita respuestas desordenadas).
// - catchError + EMPTY: si la API falla, capturamos el error y devolvemos un stream vacío
//                       para que el flujo no se rompa con una excepción sin capturar.
// - pipe:   encadena los operadores.
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import type { IncidentListItemDto } from '../../../shared/models/incident-dto.model';
import type { ResourceStatus } from '../../../shared/models/resource-state.model';
import { CitizenIncidentsApiService } from '../../../shared/services/citizen-incidents-api-service';
import { mapIncidentListItemToCard } from '../../../shared/mappers/incident.mapper';
import { isIncidentUnresolved } from '../../../shared/utils/incident-status.util';

// Tipo del filtro que el usuario puede activar en el panel.
export type DashboardFilter = 'ALL' | 'UNRESOLVED' | 'RESOLVED';

// La FORMA del estado global. NgRx recomienda tipar todo el estado con interfaces para
// que TypeScript avise si se añade o usa mal algún campo.
interface CitizenDashboardState {
  incidents: IncidentListItemDto[]; // DTOs de incidentes tal y como llegan de la API.
  activeFilter: DashboardFilter;    // Filtro activo seleccionado por el usuario.
  status: ResourceStatus;           // 'idle' | 'loading' | 'success' | 'error'.
  error: string | null;             // Mensaje de error legible para el usuario.
}

// Estado inicial. NgRx recomienda definirlo SIEMPRE (nunca dejar signals sin inicializar).
const initialState: CitizenDashboardState = {
  incidents: [],
  activeFilter: 'ALL',
  status: 'idle',
  error: null,
};

const ERROR_MESSAGE = 'Could not load your incidents. Please try again.';

// ============================================================================
// EL STORE
// ============================================================================
// `signalStore(...)` devuelve un Injectable (objeto "clase-store").
// Se compone de features (bloques), cada una tiene: estado, selectores y acciones.
export const CitizenDashboardStore = signalStore(
  // --- 1. ESTADO -----------------------------------------------------
  // Crea los signals internos del estado y los expone automáticamente como
  // propiedades de lectura (ej.: store.incidents(), store.status()).
  withState(initialState),

  // --- 2. SELECTORES DERIVADOS (computed) ------------------------------
  // Cada entrada es un computed que se recalcula SOLO cuando cambian los signals
  // de estado de los que depende. Recibe los signals de estado desempaquetados.
  withComputed(({ incidents, status, activeFilter }) => ({
    // Indicadores de estado derivados directamente de `status()`.
    isLoading: computed(() => status() === 'loading'),
    isError: computed(() => status() === 'error'),
    isSuccess: computed(() => status() === 'success'),

    // Filtra las incidencias según el filtro activo. Siempre devuelve un array NUEVO
    // (no muta `incidents`): se respeta la inmutabilidad del estado.
    filteredIncidents: computed(() => filterIncidents(incidents(), activeFilter())),

    // Misma lógica de filtrado, pero mapeada a ViewModel: lo que espera el componente
    // <app-incident-card> del template del dashboard.
    filteredIncidentsVm: computed(() =>
      filterIncidents(incidents(), activeFilter()).map(mapIncidentListItemToCard),
    ),

    // Métricas para la tarjeta de resumen ("Total Contributions").
    totalReported: computed(() => incidents().length),
    totalResolved: computed(() => incidents().filter((incident) => incident.status === 'RESOLVED').length),
    hasIncidents: computed(() => incidents().length > 0),

    // Indicadores pensados para el template:
    // - showInitialLoading: mostrar skeletons solo en la primera carga (sin datos aún).
    showInitialLoading: computed(() => status() === 'loading' && incidents().length === 0),
    // - showEmptyState: mostrar "sin incidentes" solo cuando la respuesta fue exitosa y vacía.
    showEmptyState: computed(() => status() === 'success' && incidents().length === 0),
  })),

  // --- 3. ACCIONES (métodos del store) --------------------------------
  // `store` = el store actual (estado + selectores) para poder leerlo/actualizarlo.
  // `api`   = servicio de datos inyectado como segundo argumento (lo que lo convierte
  //           en un "store testable" sin necesidad de importar el servicio globalmente).
  withMethods((store, api = inject(CitizenIncidentsApiService)) => {
    // rxMethod: define una acción reactiva. Al invocar `loadIncidents()` el componente,
    // el valor pasa por el pipeline (tap -> switchMap):
    //   1) tap()       -> marca status 'loading' y limpia el error viejo.
    //   2) switchMap() -> lanza la llamada API. Si llega otra llamada mientras una está
    //                     en curso, CANCELA la anterior (cancelación integrada).
    //   3) Dentro del API:
    //        catchError() + patchState -> si falla: estado 'error'.
    //        tap() + patchState        -> si acierta: estado 'success' con los datos.
    const loadIncidents = rxMethod<void>(
      pipe(
        // Paso 2: marcamos estado de carga y limpiamos error previo.
        tap(() => patchState(store, { status: 'loading', error: null })),
        switchMap(() =>
          // Llamada real a la API (devuelve Observable<IncidentListItemDto[]>).
          api.getSignedInCitizenIncidents().pipe(
            catchError(() => {
              patchState(store, { status: 'error', error: ERROR_MESSAGE });
              return EMPTY; // fin del flujo sin propagar la excepción.
            }),
            tap((incidents) => patchState(store, { incidents, status: 'success', error: null })),
          ),
        ),
      ),
    );

    // Las acciones que el componente podrá invocar:
    return {
      loadIncidents, // arranca la carga (llamada por el componente en ngOnInit).
      retry: () => loadIncidents(), // re-dispara la carga (botón "Try again").
      setFilter: (filter: DashboardFilter) => patchState(store, { activeFilter: filter }),
    };
  }),
);

// Función auxiliar FUERA del store (pura): más fácil de probar y reutilizar.
// No muta el array de entrada; devuelve uno nuevo filtrado.
function filterIncidents(
  incidents: IncidentListItemDto[],
  filter: DashboardFilter,
): IncidentListItemDto[] {
  if (filter === 'RESOLVED') {
    return incidents.filter((incident) => incident.status === 'RESOLVED');
  }

  if (filter === 'UNRESOLVED') {
    return incidents.filter((incident) => isIncidentUnresolved(incident.status));
  }

  return incidents;
}