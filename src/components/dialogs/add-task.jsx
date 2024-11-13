import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/api/firebase';
import { useMainContext } from '@/context/main-context';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader, X } from 'lucide-react';

function AddTaskDialog({ open, setOpen, groupId, fetchTasks }) {
  const { teacherData, uid } = useMainContext();
  const adminId = teacherData?.role;
  const { toast } = useToast();

  const defaultValues = {
    due: new Date(),
  };
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    setFiles([...files, ...event.target.files]);
  };

  // Delete one selected file
  const handleFileRemove = (fileId) => {
    setFiles((prevFiles) =>
      prevFiles.filter((prevFile) => prevFile.name !== fileId)
    );
  };

  const onSubmit = async (data) => {
    const images = [];

    await Promise.all(
      files.map(async (file) => {
        const storageRef = ref(storage, `users/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        images.push({
          url: downloadURL,
          name: file.name,
          type: file.type,
          timestamp: new Date().getTime(),
          id: uuidv4(),
        });
      })
    );

    try {
      const userGroupsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/tasks`
      );

      await addDoc(userGroupsRef, {
        ...data,
        images: images,
        timestamp: new Date().getTime(),
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

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Assign a task to the group</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-full">
              <Label htmlFor="title">Title</Label>
              <Input
                {...register('title', { required: true })}
                id="title"
                placeholder="Enter title"
              />
              {errors.title && (
                <p className="text-red-600">Title is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="due-date-label">Due Date</Label>
              <Controller
                name="due"
                control={control}
                defaultValue={new Date()}
                render={({ field }) => (
                  <ReactDatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="dd.MM.yyyy"
                    className="w-full py-2 px-3 border rounded-md bg-background"
                  />
                )}
              />
              {errors.due && (
                <p className="text-red-600">Due date is required</p>
              )}
            </div>
          </div>

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

          <div className="mx-auto w-full">
            <Label htmlFor="upload">Attachments</Label>
            <label className="flex w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-border p-6 transition-all duration-300 hover:border-gray-400">
              <div className="space-y-1 text-center">
                <div className="text-muted-foreground">
                  <p className="font-medium text-primary-500 hover:text-primary-700">
                    Click to upload
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, GIF or PDF (max. 5MG)
                </p>
              </div>
              <input
                id="upload"
                type="file"
                // accept="image/*"
                multiple
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <div className="h-20 overflow-y-auto">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 !mt-3">
              {files.map((file, index) => {
                if (file.size > MAX_FILE_SIZE) {
                  setFiles([]);
                  toast(`${file.name} exceeds the maximum file size of 5MB.`);
                  return null;
                }

                return (
                  <li
                    key={file.name}
                    className="flex items-center justify-between py-2 pl-2 pr-4 rounded-md border"
                  >
                    <div className="flex items-center gap-3">
                      {file.type === 'application/pdf' ? (
                        <img
                          src="/assets/pdf.jfif"
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-sm cursor-pointer"
                        />
                      ) : (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-sm cursor-pointer"
                        />
                      )}
                      <p className="flex items-center text-xs font-medium w-40 truncate">
                        {file.name}
                      </p>
                    </div>
                    <X
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => handleFileRemove(file.name)}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Submit Button */}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5"
            >
              {isSubmitting && <Loader className="w-3 h-3 animate-spin" />}
              <span>Qo'shish</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddTaskDialog;
