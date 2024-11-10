import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '../ui/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/api/firebase';
import { useMainContext } from '@/context/main-context';
import { Loader, Search } from 'lucide-react';

function AddEvaluation({ open, setOpen, groupId, groupStudents, fetch }) {
  const { teacherData } = useMainContext();
  const adminId = teacherData?.role;

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm) {
        const filtered = groupStudents.filter((student) =>
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filtered);
      } else {
        setFilteredStudents(groupStudents);
      }
    }, 300);

    return () => {
      clearTimeout(debounceRef.current);
    };
  }, [searchTerm, groupStudents]);

  const { toast } = useToast();

  const defaultValues = {
    timestamp: new Date(),
    students: groupStudents.map((student) => ({
      id: student.id,
      name: student.fullName,
      score: '-',
    })),
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (groupStudents.length > 0) {
      reset({
        students: groupStudents.map((student) => ({
          id: student.id,
          name: student.fullName,
          score: '-',
        })),
      });
    }
  }, [groupStudents, reset]);

  const onSubmit = async (data) => {
    try {
      const ref = collection(
        db,
        `users/${adminId}/groups/${groupId}/evaluations`
      );

      await addDoc(ref, data);
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: 'Failed to create exam',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      reset();
      fetch();
      setOpen(false);
      toast({
        title: 'Baholash muvaffaqiyatli',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add evaluation</DialogTitle>
          <DialogDescription>This is evaluation description</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Input
                className="peer pe-9 ps-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Oquvchini qidirish..."
                type="search"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search size={16} strokeWidth={2} />
              </div>
            </div>
            <Controller
              name="timestamp"
              control={control}
              defaultValue={new Date()}
              render={({ field }) => (
                <ReactDatePicker
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="dd.MM.yyyy"
                  className="w-28 py-2 px-3 border rounded-md bg-background"
                />
              )}
            />
          </div>

          {filteredStudents.map((student, index) => (
            <div
              key={student.id}
              className="grid grid-cols-1 lg:grid-cols-3 items-start gap-2 w-full"
            >
              <input type="hidden" {...register(`students.${index}.id`)} />

              <div className="space-y-1">
                <Label>Ism familiya</Label>
                <Input
                  type="text"
                  {...register(`students.${index}.name`)}
                  defaultValue={student.fullName}
                  disabled
                />
              </div>

              <fieldset className="space-y-1 col-span-2">
                <div className="flex justify-between text-xs font-medium">
                  <p>
                    <span className="text-base">😡</span> Not likely
                  </p>
                  <p>
                    Very Likely <span className="text-base">😍</span>
                  </p>
                </div>

                <Controller
                  name={`students.${index}.score`}
                  control={control}
                  defaultValue="-"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      className="flex gap-0 -space-x-px rounded-lg shadow-sm shadow-black/5"
                    >
                      {['-', 1, 2, 3, 4, 5].map((number) => (
                        <label
                          key={number}
                          htmlFor={`radio-${student.id}-${number}`}
                          className={`relative flex size-9 h-10 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border border-input text-center text-sm font-medium ring-offset-background transition-colors first:rounded-s-lg last:rounded-e-lg data-[state=checked]:z-10 data-[state=checked]:border-ring data-[state=checked]:bg-accent data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 ${
                            field.value === number.toString()
                              ? 'z-10 border-ring bg-accent'
                              : ''
                          }`}
                        >
                          <RadioGroupItem
                            id={`radio-${student.id}-${number}`}
                            value={number.toString()}
                            className="sr-only"
                          />
                          {number}
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </fieldset>
            </div>
          ))}

          {/* Submit Button */}
          <DialogFooter>
            <Button
              disabled={isSubmitting}
              className="flex items-center gap-1.5"
              type="submit"
            >
              {isSubmitting && <Loader className="w-3 h-3 animate-spin" />}
              <span>Baholash</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddEvaluation;
