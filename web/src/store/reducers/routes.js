import { ROUTE_CLEANUP, SET_CURRENT_ROUTE } from '../actions/types'

const initialState = {
    currentRoute: null
}

export const routesReducer = (state=initialState, action) => {
    switch (action.type) {
        case ROUTE_CLEANUP: {
            return initialState
        }

        case SET_CURRENT_ROUTE:
            return {
                ...state,
                currentRoute: action.payload
            }
    
        default:
            return state
    }
}