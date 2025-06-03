import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PersonAdd,
  PersonRemove,
  Search,
  Block,
} from '@mui/icons-material';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{ name: string }>;
  createdAt: string;
}

interface UserPage {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'addAdmin' | 'removeAdmin' | 'block'>('addAdmin');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Нет токена авторизации');
      }

      const response = await axios.get(`http://localhost:8080/api/users/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: page,
          size: rowsPerPage,
        },
      });

      const userPage: UserPage = response.data;
      setUsers(userPage.content);
      setTotalElements(userPage.totalElements);
    } catch (err: any) {
      console.error('Ошибка загрузки пользователей:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isAdmin = (user: User) => {
    return user.roles.some(role => role.name === 'ROLE_ADMIN');
  };

  const isSuperAdmin = (user: User) => {
    return user.roles.some(role => role.name === 'ROLE_SUPERADMIN');
  };

  const handleOpenDialog = (user: User, action: 'addAdmin' | 'removeAdmin' | 'block') => {
    setSelectedUser(user);
    setActionType(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Нет токена авторизации');
      }

      let endpoint = '';
      let method = 'POST';

      switch (actionType) {
        case 'addAdmin':
          endpoint = `http://localhost:8080/api/users/admin/assign-admin/${selectedUser.id}`;
          break;
        case 'removeAdmin':
          endpoint = `http://localhost:8080/api/users/admin/remove-admin/${selectedUser.id}`;
          method = 'DELETE';
          break;
        case 'block':
          endpoint = `http://localhost:8080/api/users/admin/toggle-block/${selectedUser.id}`;
          break;
      }

      await axios({
        method,
        url: endpoint,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(`Действие выполнено успешно`);
      fetchUsers(); // Обновляем список пользователей
      handleCloseDialog();
    } catch (err: any) {
      console.error('Ошибка выполнения действия:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка выполнения действия');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionTitle = () => {
    switch (actionType) {
      case 'addAdmin':
        return 'Назначить администратором';
      case 'removeAdmin':
        return 'Отозвать права администратора';
      case 'block':
        return 'Заблокировать пользователя';
      default:
        return '';
    }
  };

  const getActionMessage = () => {
    if (!selectedUser) return '';
    
    switch (actionType) {
      case 'addAdmin':
        return `Вы уверены, что хотите назначить пользователя "${selectedUser.username}" администратором?`;
      case 'removeAdmin':
        return `Вы уверены, что хотите отозвать права администратора у пользователя "${selectedUser.username}"?`;
      case 'block':
        return `Вы уверены, что хотите заблокировать пользователя "${selectedUser.username}"?`;
      default:
        return '';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление пользователями
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder="Поиск пользователей..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Имя пользователя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Полное имя</TableCell>
                <TableCell>Роли</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {user.roles.map((role) => (
                          <Chip
                            key={role.name}
                            label={role.name.replace('ROLE_', '')}
                            size="small"
                            color={
                              role.name === 'ROLE_SUPERADMIN'
                                ? 'error'
                                : role.name === 'ROLE_ADMIN'
                                ? 'warning'
                                : 'default'
                            }
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {!isSuperAdmin(user) && (
                          <>
                            {!isAdmin(user) ? (
                              <Tooltip title="Назначить администратором">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(user, 'addAdmin')}
                                >
                                  <PersonAdd />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Отозвать права администратора">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => handleOpenDialog(user, 'removeAdmin')}
                                >
                                  <PersonRemove />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Заблокировать пользователя">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDialog(user, 'block')}
                              >
                                <Block />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
          }
        />
      </Paper>

      {/* Диалог подтверждения */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{getActionTitle()}</DialogTitle>
        <DialogContent>
          <Typography>
            {getActionMessage()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleConfirmAction} variant="contained" autoFocus>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement; 