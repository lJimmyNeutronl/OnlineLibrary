import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App.tsx'
import './index.css'
import { setupFavoritesMocks } from './mocks/booksMock'

// Глобальная настройка PDF.js
import './utils/pdfjs'

// Инициализация мок-данных (только для разработки)
setupFavoritesMocks()

// Делаем store доступным глобально для админ-панели
// @ts-ignore
window.__REDUX_STORE__ = store;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
