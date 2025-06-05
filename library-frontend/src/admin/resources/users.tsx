import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  Show,
  SimpleShowLayout,
  TopToolbar,
  Button,
  useRecordContext,
  useUpdate,
  useNotify,
  useRefresh,
  usePermissions,
} from 'react-admin';
import { Chip, Box } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import BlockIcon from '@mui/icons-material/Block';

// Функция для проверки, является ли пользователь суперадмином
const isSuperAdminUser = (permissions: string[]): boolean => {
  return permissions.includes('ROLE_SUPERADMIN');
};

// Компонент для отображения ролей пользователя
const UserRoles = () => {
  const record = useRecordContext();
  if (!record || !record.roles) return null;

  return (
    <Box>
      {record.roles.map((role: any, index: number) => (
        <Chip
          key={index}
          label={role.name.replace('ROLE_', '')}
          size="small"
          color={role.name === 'ROLE_SUPERADMIN' ? 'error' : role.name === 'ROLE_ADMIN' ? 'warning' : 'default'}
          style={{ margin: '2px' }}
        />
      ))}
    </Box>
  );
};

// Кнопка для назначения роли администратора
const AssignAdminButton = () => {
  const record = useRecordContext();
  const [update, { isLoading }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();
  const { permissions } = usePermissions();

  // Проверяем, является ли текущий пользователь суперадмином
  if (!permissions || !isSuperAdminUser(permissions)) {
    return null; // Скрываем кнопку для обычных админов
  }

  if (!record) return null;

  const isAdmin = record.roles?.some((role: any) => role.name === 'ROLE_ADMIN');
  const isSuperAdmin = record.roles?.some((role: any) => role.name === 'ROLE_SUPERADMIN');

  if (isAdmin || isSuperAdmin) return null;

  const handleAssignAdmin = () => {
    update(
      'users',
      {
        id: record.id,
        data: { action: 'assignAdmin' },
        previousData: record,
      },
      {
        onSuccess: () => {
          notify('Роль администратора назначена', { type: 'success' });
          refresh();
        },
        onError: () => {
          notify('Ошибка назначения роли администратора', { type: 'error' });
        },
      }
    );
  };

  return (
    <Button
      onClick={handleAssignAdmin}
      disabled={isLoading}
      startIcon={<PersonAddIcon />}
      variant="outlined"
      color="warning"
      size="small"
    >
      Назначить админом
    </Button>
  );
};

// Кнопка для удаления роли администратора
const RemoveAdminButton = () => {
  const record = useRecordContext();
  const [update, { isLoading }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();
  const { permissions } = usePermissions();

  // Проверяем, является ли текущий пользователь суперадмином
  if (!permissions || !isSuperAdminUser(permissions)) {
    return null; // Скрываем кнопку для обычных админов
  }

  if (!record) return null;

  const isAdmin = record.roles?.some((role: any) => role.name === 'ROLE_ADMIN');
  const isSuperAdmin = record.roles?.some((role: any) => role.name === 'ROLE_SUPERADMIN');

  if (!isAdmin || isSuperAdmin) return null;

  const handleRemoveAdmin = () => {
    update(
      'users',
      {
        id: record.id,
        data: { action: 'removeAdmin' },
        previousData: record,
      },
      {
        onSuccess: () => {
          notify('Роль администратора удалена', { type: 'success' });
          refresh();
        },
        onError: () => {
          notify('Ошибка удаления роли администратора', { type: 'error' });
        },
      }
    );
  };

  return (
    <Button
      onClick={handleRemoveAdmin}
      disabled={isLoading}
      startIcon={<PersonRemoveIcon />}
      variant="outlined"
      color="error"
      size="small"
    >
      Убрать админа
    </Button>
  );
};

// Кнопка для блокировки пользователя
const ToggleBlockButton = () => {
  const record = useRecordContext();
  const [update, { isLoading }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();
  const { permissions } = usePermissions();

  // Проверяем, является ли текущий пользователь суперадмином
  if (!permissions || !isSuperAdminUser(permissions)) {
    return null; // Скрываем кнопку для обычных админов
  }

  if (!record) return null;

  const isSuperAdmin = record.roles?.some((role: any) => role.name === 'ROLE_SUPERADMIN');

  if (isSuperAdmin) return null;

  const handleToggleBlock = () => {
    update(
      'users',
      {
        id: record.id,
        data: { action: 'toggleBlock' },
        previousData: record,
      },
      {
        onSuccess: () => {
          notify('Статус блокировки изменен', { type: 'success' });
          refresh();
        },
        onError: () => {
          notify('Ошибка изменения статуса блокировки', { type: 'error' });
        },
      }
    );
  };

  return (
    <Button
      onClick={handleToggleBlock}
      disabled={isLoading}
      startIcon={<BlockIcon />}
      variant="outlined"
      color="secondary"
      size="small"
    >
      Блокировать
    </Button>
  );
};

// Кнопки действий для списка пользователей
const UserActions = () => {
  const { permissions } = usePermissions();

  // Если у пользователя нет прав суперадмина, не показываем никаких кнопок
  if (!permissions || !isSuperAdminUser(permissions)) {
    return null;
  }

  return (
    <Box display="flex" gap={1}>
      <AssignAdminButton />
      <RemoveAdminButton />
      <ToggleBlockButton />
    </Box>
  );
};

// Список пользователей
export const UserList = () => (
  <List
    title="Пользователи"
    perPage={25}
    sort={{ field: 'registrationDate', order: 'DESC' }}
  >
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <TextField source="firstName" label="Имя" />
      <TextField source="lastName" label="Фамилия" />
      <EmailField source="email" label="Email" />
      <UserRoles />
      <DateField source="registrationDate" label="Дата регистрации" showTime />
      <DateField source="lastLoginDate" label="Последний вход" showTime />
      <UserActions />
    </Datagrid>
  </List>
);

// Показ пользователя
export const UserShow = () => {
  const { permissions } = usePermissions();

  return (
    <Show title="Пользователь">
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <TextField source="firstName" label="Имя" />
        <TextField source="lastName" label="Фамилия" />
        <EmailField source="email" label="Email" />
        <UserRoles />
        <DateField source="registrationDate" label="Дата регистрации" showTime />
        <DateField source="lastLoginDate" label="Последний вход" showTime />
        
        {/* Показываем TopToolbar только для суперадминов */}
        {permissions && isSuperAdminUser(permissions) && (
          <TopToolbar>
            <AssignAdminButton />
            <RemoveAdminButton />
            <ToggleBlockButton />
          </TopToolbar>
        )}
      </SimpleShowLayout>
    </Show>
  );
};