import { History } from 'history';
import { throttle } from 'lodash';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore as _createStore,
  Store,
  StoreEnhancer
} from 'redux';
import createSagaMiddleware from 'redux-saga';

import { loadStoredState, saveState } from './localStorage';
import reducers from 'src/reducers';
import { defaultState, IState } from 'src/reducers/states';
import mainSaga from 'src/sagas';
import { history as appHistory } from 'src/utils/history';

declare var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: () => StoreEnhancer<IState>;

export function createStore(history: History): Store<IState> {
  let composeEnhancers: any = compose;
  const sagaMiddleware = createSagaMiddleware();
  const middleware = [sagaMiddleware, routerMiddleware(history)];

  if (typeof __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = __REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }

  const rootReducer = combineReducers<IState>({
    ...reducers,
    router: routerReducer
  });
  const enchancers = composeEnhancers(applyMiddleware(...middleware));
  const loadedStore = loadStoredState();
  let initialStore: IState = defaultState;
  if (loadedStore) {
    initialStore = {
      ...defaultState,
      session: {
        ...defaultState.session,
        ...(loadedStore.session ? loadedStore.session : {})
      },
      workspaces: {
        ...defaultState.workspaces,
        playground: {
          ...defaultState.workspaces.playground,
          editorValue: loadedStore.playgroundEditorValue
            ? loadedStore.playgroundEditorValue
            : defaultState.workspaces.playground.editorValue,
          isEditorAutorun: loadedStore.playgroundIsEditorAutorun
            ? loadedStore.playgroundIsEditorAutorun
            : defaultState.workspaces.playground.isEditorAutorun,
          externalLibrary: loadedStore.playgroundExternalLibrary
            ? loadedStore.playgroundExternalLibrary
            : defaultState.workspaces.playground.externalLibrary,
          context: {
            ...defaultState.workspaces.playground.context,
            chapter: loadedStore.playgroundSourceChapter
              ? loadedStore.playgroundSourceChapter
              : defaultState.workspaces.playground.context.chapter,
            variant: loadedStore.playgroundSourceVariant
              ? loadedStore.playgroundSourceVariant
              : defaultState.workspaces.playground.context.variant
          }
        }
      }
    };
  }
  const createdStore = _createStore<IState>(rootReducer, initialStore, enchancers);

  sagaMiddleware.run(mainSaga);

  createdStore.subscribe(
    throttle(() => {
      saveState(store.getState());
    }, 1000)
  );

  return createdStore;
}

export const store = createStore(appHistory) as Store<IState>;