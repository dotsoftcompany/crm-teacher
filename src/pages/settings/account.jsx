import React from 'react';
import { useForm } from 'react-hook-form';

import BreadcrumbComponent from '@/components/breadcrumb';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function Account() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data); // Handle form submission here
  };
  return (
    <div className="px-4 lg:px-8 mx-auto my-4 space-y-4">
      <BreadcrumbComponent title="Account" />

      <div>
        <div className="space-y-6">
          <header className="space-y-1.5">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold">Catherine Grant</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Product Designer
                </p>
              </div>
            </div>
          </header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      {...register('name', { required: 'Name is required' })} // React Hook Form integration
                    />
                    {errors.name && (
                      <p className="text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      placeholder="Enter your position"
                      {...register('position', {
                        required: 'Position is required',
                      })} // React Hook Form integration
                    />
                    {errors.position && (
                      <p className="text-red-600">{errors.position.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone"
                      type="tel"
                      {...register('phone', {
                        required: 'Phone is required',
                        pattern: {
                          value: /^[0-9]+$/,
                          message: 'Invalid phone number',
                        },
                      })}
                    />
                    {errors.phone && (
                      <p className="text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter your address"
                      {...register('address')}
                    />
                  </div>
                </div>
              </div>

              {/* Change Username and Password */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">
                  Change Username and Password
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Username"
                      {...register('username', {
                        required: 'Username is required',
                      })}
                    />
                    {errors.username && (
                      <p className="text-red-600">{errors.username.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      placeholder="Password"
                      type="password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                    />
                    {errors.password && (
                      <p className="text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit">Submit</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Account;
