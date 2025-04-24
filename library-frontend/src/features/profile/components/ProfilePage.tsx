import React, { useState } from 'react';
import { UpdateProfileData } from '../types';
import ProfileInfo from './ProfileInfo';
import FavoriteBooks from './FavoriteBooks';
import ReadingHistoryList from './ReadingHistoryList';
import { useProfile } from '../hooks/useProfile';
import '../styles/profile.css';

/**
 * Компонент страницы профиля пользователя
 */
const ProfilePage: React.FC = () => {
  const { profile, isLoading, error, updateProfile, removeFavoriteBook } = useProfile();
  const [activeTab, setActiveTab] = useState<'info' | 'favorites' | 'history'>('info');

  const handleUpdateProfile = async (updatedData: UpdateProfileData) => {
    try {
      await updateProfile(updatedData);
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
    }
  };

  if (isLoading && !profile) {
    return <div className="loading">Загрузка профиля...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profile) {
    return <div className="error-message">Профиль не найден</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Личный кабинет</h1>
        
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} 
            onClick={() => setActiveTab('info')}
          >
            Информация
          </button>
          <button 
            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`} 
            onClick={() => setActiveTab('favorites')}
          >
            Избранное
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
          >
            История чтения
          </button>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && (
          <ProfileInfo 
            profile={profile} 
            onUpdateProfile={handleUpdateProfile} 
          />
        )}

        {activeTab === 'favorites' && (
          <FavoriteBooks 
            favorites={profile.favoriteBooks} 
            onRemoveFromFavorites={async (id: number) => {
              try {
                await removeFavoriteBook(id);
              } catch (err) {
                console.error('Ошибка при удалении книги из избранного:', err);
              }
            }}
          />
        )}

        {activeTab === 'history' && (
          <ReadingHistoryList readingHistory={profile.readingHistory} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 