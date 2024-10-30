import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useMainContext } from '@/context/main-context';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import StudentsDataTable from '@/components/students/data-table';
import GroupHeader from '@/components/groups/header';
import AddStudentDialog from '@/components/dialogs/add-student';
import BreadcrumbComponent from '@/components/breadcrumb';
import EditDialog from '@/components/dialogs/edit-dialog';
import StudentEdit from '@/components/students/edit';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import AddAbsenteeDialog from '@/components/dialogs/add-absentee';
import ListAbsenteeDialog from '@/components/dialogs/list-absentee';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '@/api/firebase';
import DeleteAlert from '@/components/dialogs/delete-alert';
import AddExamDialog from '@/components/dialogs/add-exam';
import DateTime from '@/components/ui/date-time';
import { I18nProvider } from 'react-aria';
import { formatDateNew } from '@/lib/utils';

const Group = () => {
  const { groupId } = useParams();

  const userId = '9qS2pojPEhf7JOCZNUb4Cvwev6C3';

  const { groups, courses } = useMainContext();
  const group = groups.find((g) => g.id === groupId);

  const [openStudentEditDialog, setOpenStudentEditDialog] = useState(false);
  const [openStudentDeleteDialog, setOpenStudentDeleteDialog] = useState(false);
  const [openAddAbsenteeDialog, setOpenAddAbsenteeDialog] = useState(false);
  const [showAbsenteeStudentsDialog, setShowAbsenteeStudentsDialog] =
    useState(false);
  const [groupStudents, setGroupStudents] = useState([]);
  const [openAddExam, setOpenAddExam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentGroupStudents, setCurrentGroupStudents] = useState([]);
  let [date, setDate] = useState(null);

  const fetchGroupStudents = useCallback(async () => {
    setLoading(true);

    try {
      const groupRef = doc(db, `users/${userId}/groups`, groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const studentIds = groupData.students || [];
        setCurrentGroupStudents(studentIds);

        if (studentIds.length > 0) {
          const studentsRef = collection(db, `users/${userId}/students`);
          const q = query(studentsRef, where('__name__', 'in', studentIds));

          const querySnapshot = await getDocs(q);
          const fetchedStudents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setGroupStudents(fetchedStudents);
        } else {
          setGroupStudents([]);
        }
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examsRef = collection(
          db,
          `users/${userId}/groups/${groupId}/exams`
        );
        const querySnapshot = await getDocs(examsRef);

        const examsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExams(examsList);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExams();
  }, [userId, groupId]);

  useEffect(() => {
    fetchGroupStudents();
  }, [groupId]);

  if (!group) {
    return (
      <div className="px-4 lg:px-8 mx-auto py-4">
        <h2 className="text-2xl font-bold tracking-tight">404 error</h2>
        <p className="text-muted-foreground">
          Siz qidirayotgan guruh topilmadi!
        </p>
      </div>
    );
  }

  console.log(date);

  return (
    <div className="px-4 lg:px-8 mt-4">
      <BreadcrumbComponent
        title="Guruhlar ro'yxati"
        titleLink="/groups"
        subtitle={`${
          courses.filter((item) => item.id === group.courseId)[0].courseTitle
        } #${group.groupNumber}`}
      />
      <GroupHeader group={group} />

      <EditDialog
        open={openStudentEditDialog}
        setOpen={setOpenStudentEditDialog}
      >
        <StudentEdit />
      </EditDialog>

      <DeleteAlert
        open={openStudentDeleteDialog}
        setOpen={setOpenStudentDeleteDialog}
      />

      <AddAbsenteeDialog
        open={openAddAbsenteeDialog}
        setOpen={setOpenAddAbsenteeDialog}
      />

      <ListAbsenteeDialog
        open={showAbsenteeStudentsDialog}
        setOpen={setShowAbsenteeStudentsDialog}
      />

      <AddExamDialog
        open={openAddExam}
        setOpen={setOpenAddExam}
        groupId={groupId}
      />

      <Tabs defaultValue="students" className="mt-4">
        <TabsList>
          <TabsTrigger value="students">O'quvchilar ro'yxati</TabsTrigger>
          <TabsTrigger value="attendance_check">Yo'qlamalar</TabsTrigger>
          <TabsTrigger value="exams">Imtihonlar</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <StudentsDataTable
            data={groupStudents}
            setOpenEdit={setOpenStudentEditDialog}
            setOpenDelete={setOpenStudentDeleteDialog}
          />
        </TabsContent>
        <TabsContent value="attendance_check">
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <Input placeholder="Enter date" className="max-w-md" />
              <Button
                onClick={() => setOpenAddAbsenteeDialog(true)}
                variant="secondary"
                className="dark:bg-white dark:text-black"
              >
                Yo'qlama qilsh
              </Button>
            </div>

            <Table className="rounded-b-md">
              <TableCaption className="hidden">
                A list of absent students for the selected date.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-72 rounded-tl-md">Sana</TableHead>
                  <TableHead>Nechtadan</TableHead>
                  <TableHead>Foizda (%)</TableHead>
                  <TableHead className="text-right rounded-tr-md"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Sample data */}
                <TableRow>
                  <TableCell className="font-medium">12.11.2024</TableCell>
                  <TableCell>9/10</TableCell>
                  <TableCell>90%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => setShowAbsenteeStudentsDialog(true)}
                      variant="link"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Eye className="w-5 h-5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <small>Batafsil</small>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium rounded-bl-lg">
                    23.12.2023
                  </TableCell>
                  <TableCell>8/10</TableCell>
                  <TableCell>80%</TableCell>
                  <TableCell className="text-right rounded-br-lg">
                    <Button
                      onClick={() => setShowAbsenteeStudentsDialog(true)}
                      variant="link"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Eye className="w-5 h-5" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <small>Batafsil</small>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="exams">
          <I18nProvider locale="ru-RU">
            <DateTime label="Date" value={date} onChange={setDate} />
            <p>Selected date: {formatDateNew(date)}</p>
          </I18nProvider>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <Input placeholder="Imtihonni qidirish..." className="max-w-md" />
              <Button
                onClick={() => setOpenAddExam(true)}
                variant="secondary"
                className="dark:bg-white dark:text-black"
              >
                Imtihon qo'shish
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table className="rounded-b-md min-w-[50rem] w-full">
                <TableCaption className="hidden">
                  A list of absent students for the selected date.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-72 rounded-tl-md">Title</TableHead>
                    <TableHead>Start date</TableHead>
                    <TableHead>End date</TableHead>
                    <TableHead>Place</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="rounded-tr-md text-center">
                      View
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow>
                      <TableCell className="w-72 ">{exam?.title}</TableCell>
                      <TableCell>{exam?.startDate}</TableCell>
                      <TableCell>{exam?.endDate}</TableCell>
                      <TableCell>{exam?.place}</TableCell>
                      <TableCell>{exam?.status}</TableCell>
                      <TableCell className="rounded-br-lg text-center">
                        <Link to={`/groups/${groupId}/exam/${exam.id}`}>
                          <Button
                            onClick={() => setShowAbsenteeStudentsDialog(true)}
                            variant="link"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Eye className="w-5 h-5" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <small>Batafsil</small>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Group;
