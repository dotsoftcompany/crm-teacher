import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Label } from '@/components/ui/label';
import { useToast } from '../ui/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/api/firebase';
import { I18nProvider } from 'react-aria';
import DateTime from '../ui/date-time';
import { useMainContext } from '@/context/main-context';
import { formatDateTime } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

function AddExamDialog({ open, setOpen, groupId, fetchExams }) {
  const { teacherData } = useMainContext();
  const adminId = teacherData?.role;

  const { toast } = useToast();

  const defaultValues = {
    title: '',
    start: '',
    end: '',
    status: '',
    type: '',
    isTest: true,
  };

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
        `users/${adminId}/groups/${groupId}/exams`
      );

      await addDoc(userGroupsRef, {
        ...data,
        start: formatDateTime(data.start),
        end: formatDateTime(data.end),
        isShow: false,
        timestamp: serverTimestamp(),
      });

      reset();
      fetchExams();
      setOpen(false);
      toast({
        title: 'Exam successfully added!',
      });
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: 'Failed to create exam',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Exam</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="flex items-start gap-2">
            <div className="w-full">
              <Label id="start-date-label" htmlFor="start">
                Start Date
              </Label>
              <Controller
                name="start"
                control={control}
                defaultValue=""
                rules={{
                  required: "Bu yerni to'ldirish talab qilinadi",
                }}
                render={({ field }) => (
                  <I18nProvider locale="ru-RU">
                    <DateTime
                      disabled={isSubmitting}
                      value={field.value}
                      onChange={field.onChange}
                      ariaLabelledby="start-date-label"
                    />
                  </I18nProvider>
                )}
              />
              {errors.start && (
                <p className="text-red-600">Start Date is required</p>
              )}
            </div>

            <div className="w-full">
              <Label id="end-date-label" htmlFor="end">
                End Date
              </Label>
              <Controller
                name="end"
                control={control}
                defaultValue=""
                rules={{
                  required: "Bu yerni to'ldirish talab qilinadi",
                }}
                render={({ field }) => (
                  <I18nProvider locale="ru-RU">
                    <DateTime
                      disabled={isSubmitting}
                      value={field.value}
                      onChange={field.onChange}
                      ariaLabelledby="end-date-label"
                    />
                  </I18nProvider>
                )}
              />
              {errors.end && (
                <p className="text-red-600">End Date is required</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-full">
              <Label htmlFor="type">type</Label>
              <Controller
                name="type"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <SelectTrigger aria-label="Select exam type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-red-600">type is required</p>}
            </div>

            <div className="w-full">
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
                    <SelectTrigger aria-label="Select exam status">
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
          </div>

          <div className="flex items-center space-x-2 py-2.5 px-3 rounded-lg border border-border">
            <Controller
              name="isTest"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={value}
                  onCheckedChange={onChange}
                  id="isTest"
                />
              )}
            />
            <Label htmlFor="isTest">Imtixon test shaklda</Label>
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
