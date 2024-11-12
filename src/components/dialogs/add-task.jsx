import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '../ui/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/api/firebase';
import DateTime from '../ui/date-time';
import { useMainContext } from '@/context/main-context';
import { formatDateTime } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

function AddTaskDialog({ open, setOpen, groupId, fetchTasks }) {
  const { teacherData } = useMainContext();
  const adminId = teacherData?.role;
  const { toast } = useToast();

  const defaultValues = {};
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const onSubmit = async (data) => {
    try {
      const userGroupsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/tasks`
      );

      await addDoc(userGroupsRef, {
        ...data,
        due: formatDateTime(data.due),
        timestamp: serverTimestamp(),
      });

      reset();
      setOpen(false);
      fetchTasks();
      toast({
        title: 'Task successfully added!',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Failed to create task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Assign a task to the group</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title Input */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              {...register('title', { required: true })}
              id="title"
              placeholder="Enter title"
            />
            {errors.title && <p className="text-red-600">Title is required</p>}
          </div>

          {/* Due Date Input */}
          <div>
            <Label htmlFor="due-date-label">Due Date</Label>
            <Controller
              name="due"
              control={control}
              rules={{ required: 'Due date is required' }}
              render={({ field }) => (
                <DateTime
                  className="!h-10 !rounded-md"
                  disabled={isSubmitting}
                  value={field.value}
                  onChange={field.onChange}
                  ariaLabelledby="due-date-label"
                />
              )}
            />
            {errors.due && <p className="text-red-600">Due date is required</p>}
          </div>

          {/* Description Input */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...register('description', { required: true })}
              id="description"
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-red-600">Description is required</p>
            )}
          </div>

          {/* Submit Button */}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddTaskDialog;
