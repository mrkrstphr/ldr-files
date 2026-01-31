export const initialState = {
  // UI state
  loading: true,
  metadataOpen: false,
  selectedSubModel: '',

  // Model state
  model: null,
  numBuildingSteps: 0,

  // Playback state
  currentBuildingStep: 0,
  isPlaying: false,
  playSpeed: 1,
  looping: false,
  direction: 1,
};

export function modelReducer(state, action) {
  switch (action.type) {
    case 'MODEL_LOADED':
      return {
        ...state,
        loading: false,
        model: action.payload.model,
        numBuildingSteps: action.payload.numBuildingSteps,
        currentBuildingStep: action.payload.numBuildingSteps,
      };

    case 'TOGGLE_METADATA':
      return {
        ...state,
        metadataOpen: !state.metadataOpen,
      };

    case 'SELECT_SUBMODEL':
      return {
        ...state,
        selectedSubModel: action.payload,
        isPlaying: false,
        loading: true,
      };

    case 'PLAY':
      return {
        ...state,
        isPlaying: true,
        currentBuildingStep:
          state.currentBuildingStep >= state.numBuildingSteps
            ? 0
            : state.currentBuildingStep,
      };

    case 'PAUSE':
      return {
        ...state,
        isPlaying: false,
      };

    case 'SET_BUILDING_STEP':
      return {
        ...state,
        currentBuildingStep: action.payload,
      };

    case 'TICK':
      // Handle animation tick - controls automatic playback
      if (state.currentBuildingStep === state.numBuildingSteps) {
        // At the end of the animation
        if (state.looping) {
          // Loop back and reverse direction
          return {
            ...state,
            direction: -1,
            currentBuildingStep:
              state.currentBuildingStep + state.direction * -1,
          };
        }
        // Stop playing at the end
        return {
          ...state,
          isPlaying: false,
        };
      } else if (state.currentBuildingStep === 0 && state.direction === -1) {
        // At the beginning when going backwards, reverse to go forward
        return {
          ...state,
          direction: 1,
          currentBuildingStep: 1,
        };
      }

      // Normal step increment/decrement
      return {
        ...state,
        currentBuildingStep: Math.min(
          state.currentBuildingStep + state.direction,
          state.numBuildingSteps,
        ),
      };

    case 'SET_PLAY_SPEED':
      return {
        ...state,
        playSpeed: action.payload,
      };

    case 'TOGGLE_LOOPING':
      return {
        ...state,
        looping: !state.looping,
      };

    case 'RESET_FOR_NEW_MODEL':
      return {
        ...state,
        loading: true,
        selectedSubModel: '',
        isPlaying: false,
      };

    case 'SET_DEFAULT_SUBMODEL':
      return {
        ...state,
        selectedSubModel: action.payload,
      };

    case 'START_LOADING':
      return {
        ...state,
        loading: true,
      };

    default:
      return state;
  }
}
