'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Plus, Trash2, KeyRound, ShieldCheck, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

import {
  createUser,
  deleteUser,
  toggleUserRole,
  resetUserPassword
} from '@/server/users';

interface UserItem {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  firstName: string;
  lastName: string;
  middleName: string;
  studentNo: string;
  lrn: string;
  address: string;
  phoneNo: string;
}

export default function UserManagementClient({
  users,
  totalUsers,
  currentPage,
  pageSize,
  availableRoles = ['ADMIN', 'STUDENT']
}: {
  users: UserItem[];
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  availableRoles?: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [addOpen, setAddOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Add user form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'STUDENT',
    firstName: '',
    lastName: '',
    middleName: '',
    studentNo: '',
    lrn: '',
    address: '',
    phoneNo: ''
  });

  const totalPages = Math.ceil(totalUsers / pageSize);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    params.set('page', '1');
    router.push(`/dashboard/settings/user-management?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/dashboard/settings/user-management?${params.toString()}`);
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await createUser(newUser);
      toast.success('User created successfully');
      setAddOpen(false);
      setNewUser({
        email: '',
        password: '',
        role: 'STUDENT',
        firstName: '',
        lastName: '',
        middleName: '',
        studentNo: '',
        lrn: '',
        address: '',
        phoneNo: ''
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success('User deleted');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete user');
    }
  };

  const handleToggleRole = async (userId: string) => {
    try {
      await toggleUserRole(userId);
      toast.success('Role updated');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update role');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await resetUserPassword(resetUserId, newPassword);
      toast.success('Password reset successfully');
      setResetOpen(false);
      setNewPassword('');
      setResetUserId('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, email, or student no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-[300px]"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v) =>
                    setNewUser({ ...newUser, role: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Middle Name</Label>
                <Input
                  value={newUser.middleName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, middleName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student No.</Label>
                  <Input
                    value={newUser.studentNo}
                    onChange={(e) =>
                      setNewUser({ ...newUser, studentNo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>LRN</Label>
                  <Input
                    value={newUser.lrn}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lrn: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Phone No.</Label>
                <Input
                  value={newUser.phoneNo}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phoneNo: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={newUser.address}
                  onChange={(e) =>
                    setNewUser({ ...newUser, address: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for this user
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Student No.</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName || user.lastName
                      ? `${user.lastName}${user.lastName && user.firstName ? ', ' : ''}${user.firstName}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.studentNo || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === 'ADMIN' ? 'destructive' : 'default'
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.emailVerified ? 'default' : 'secondary'}
                    >
                      {user.emailVerified ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleToggleRole(user.id)}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Toggle Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setResetUserId(user.id);
                            setResetOpen(true);
                          }}
                        >
                          <KeyRound className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
