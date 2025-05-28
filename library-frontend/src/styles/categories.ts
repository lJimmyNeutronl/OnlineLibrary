import { CSSProperties } from 'react';

/**
 * Часто используемые стили для компонентов категорий
 */
export const categoryStyles = {
  iconWrapper: {
    background: 'linear-gradient(135deg, #8e54e9 0%, #4776e6 100%)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '14px',
  } as CSSProperties,

  categoryIconWrapper: {
    background: 'linear-gradient(135deg, #3769f5 0%, #8e54e9 100%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    boxShadow: '0 2px 8px rgba(55, 105, 245, 0.2)',
  } as CSSProperties,

  categoryTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#3769f5',
  } as CSSProperties,

  subcategoryTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#8e54e9',
  } as CSSProperties,

  bookCountText: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    color: '#666',
  } as CSSProperties,

  subcategoryBookCountText: {
    margin: '3px 0 0 0',
    fontSize: '13px',
    color: '#666',
  } as CSSProperties,

  expandButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(55, 105, 245, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  subcategoryContainer: {
    background: 'rgba(142, 84, 233, 0.05)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '8px',
    border: '1px solid rgba(142, 84, 233, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  categoryContainer: {
    background: 'rgba(55, 105, 245, 0.05)',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid rgba(55, 105, 245, 0.1)',
    transition: 'all 0.3s ease',
  } as CSSProperties,

  subcategoriesWrapper: {
    marginLeft: '30px',
    borderLeft: '1px dashed rgba(55, 105, 245, 0.3)',
    paddingLeft: '20px',
  } as CSSProperties,
}; 