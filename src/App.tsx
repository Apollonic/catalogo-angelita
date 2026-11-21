import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SellerAuthPage } from './pages/SellerAuthPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas dos Clientes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/produto/:id" element={<ProductDetailPage />} />

        {/* Rotas da Vendedora */}
        <Route path="/vendedora" element={<SellerAuthPage />} />
        <Route
          path="/vendedora/painel"
          element={
            <ProtectedRoute>
              <SellerDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Redirecionamento padrão para rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
