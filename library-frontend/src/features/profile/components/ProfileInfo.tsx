import React, { useState } from 'react';
import { UserProfile, UpdateProfileData } from '../types';

interface ProfileInfoProps {
  profile: UserProfile;
  onUpdateProfile: (data: UpdateProfileData) => void;
}

/**
 * Компонент для отображения и редактирования информации профиля
 */
const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    bio: profile.bio,
    avatar: profile.avatar
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="profile-info">
      {!isEditing ? (
        <div className="profile-view">
          <div className="profile-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.displayName} />
            ) : (
              <div className="avatar-placeholder">
                {profile.displayName.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="profile-details">
            <h2>{profile.displayName}</h2>
            <p className="profile-email">{profile.email}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            
            <div className="profile-meta">
              <div className="meta-item">
                <span className="meta-label">Избранные жанры:</span>
                <span className="meta-value">
                  {profile.preferences.favoriteGenres && profile.preferences.favoriteGenres.length > 0 
                    ? profile.preferences.favoriteGenres.join(', ') 
                    : 'Не указаны'}
                </span>
              </div>
            </div>
            
            <button 
              className="edit-profile-button" 
              onClick={() => setIsEditing(true)}
            >
              Редактировать профиль
            </button>
          </div>
        </div>
      ) : (
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">Имя</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Фамилия</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="avatar">URL аватара</label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              value={formData.avatar || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">О себе</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              rows={4}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-button">Сохранить</button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setIsEditing(false)}
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileInfo; 