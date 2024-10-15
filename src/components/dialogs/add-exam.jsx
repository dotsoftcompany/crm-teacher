import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { useToast } from '../ui/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/api/firebase';

function AddExamDialog({ open, setOpen, groupId }) {
  const userId = '9qS2pojPEhf7JOCZNUb4Cvwev6C3';
  const { toast } = useToast();

  const defaultValues = {
    title: '',
    startDate: '',
    endDate: '',
    status: '',
    place: '',
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const onSubmit = async (data) => {
    try {
      const userGroupsRef = collection(
        db,
        `users/${userId}/groups/${groupId}/exams`
      );

      await addDoc(userGroupsRef, data).then(() => {
        reset();
        setOpen(false);
        toast({
          title: "Imtixon muvaffaqiyat qo'shildi",
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Exam</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              {...register('title', { required: true })}
              id="title"
              placeholder="Enter title"
            />
            {errors.title && <p className="text-red-600">Title is required</p>}
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              {...register('startDate', { required: true })}
              id="startDate"
              placeholder="01.12.2024 - 10AM"
            />
            {errors.startDate && (
              <p className="text-red-600">Start Date is required</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              {...register('endDate', { required: true })}
              id="endDate"
              placeholder="02.12.2024 - 10PM"
            />
            {errors.endDate && (
              <p className="text-red-600">End Date is required</p>
            )}
          </div>

          {/* Place */}
          <div>
            <Label htmlFor="place">Place</Label>
            <Controller
              name="place"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select place" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.place && <p className="text-red-600">Place is required</p>}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-red-600">Status is required</p>
            )}
          </div>

          {/* Submit Button */}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddExamDialog;
