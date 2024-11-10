import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, Loader, Search } from 'lucide-react';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import { useMainContext } from '@/context/main-context';
import { db } from '@/api/firebase';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import StudentsDataTable from '@/components/students/data-table';
import GroupHeader from '@/components/groups/header';
import BreadcrumbComponent from '@/components/breadcrumb';
import EditDialog from '@/components/dialogs/edit-dialog';
import StudentEdit from '@/components/students/edit';
import AddAbsenteeDialog from '@/components/dialogs/add-absentee';
import ListAbsenteeDialog from '@/components/dialogs/list-absentee';
import DeleteAlert from '@/components/dialogs/delete-alert';
import AddExamDialog from '@/components/dialogs/add-exam';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { scoreColor } from '@/lib/utils';
import AddEvaluation from '@/components/dialogs/add-evaluation';
import { format } from 'date-fns';

const Group = () => {
  const { groupId } = useParams();

  const { groups, courses, adminId, groupStudents, setGroupStudents } =
    useMainContext();
  const group = groups.find((g) => g.id === groupId);
  const { toast } = useToast();

  const [openStudentEditDialog, setOpenStudentEditDialog] = useState(false);
  const [openStudentDeleteDialog, setOpenStudentDeleteDialog] = useState(false);
  const [openAddAbsenteeDialog, setOpenAddAbsenteeDialog] = useState(false);
  const [showAbsenteeStudentsDialog, setShowAbsenteeStudentsDialog] =
    useState(false);
  const [openAddExam, setOpenAddExam] = useState(false);
  const [openAddEvaluation, setOpenAddEvaluation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [disabled, setDisabled] = useState({});

  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef(null);

  const fetchGroupStudents = useCallback(async () => {
    setLoadingStudents(true);

    try {
      const groupRef = doc(db, `users/${adminId}/groups`, groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const studentIds = groupData.students || [];

        if (studentIds.length > 0) {
          const studentsRef = collection(db, `students`);
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
      setLoadingStudents(false);
    }
  }, [adminId, groupId]);

  useEffect(() => {
    if (groupId) {
      fetchGroupStudents();
    }
  }, [groupId, fetchGroupStudents]);

  const [exams, setExams] = useState([]);

  const fetchExams = async () => {
    try {
      const examsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/exams`
      );
      const querySnapshot = await getDocs(examsRef);

      const examsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setExams(examsList);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const [evaluations, setEvaluations] = useState([]);

  const fetchEvaluations = async () => {
    try {
      const evaluationsRef = collection(
        db,
        `users/${adminId}/groups/${groupId}/evaluations`
      );
      const querySnapshot = await getDocs(evaluationsRef);

      const evaluationsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvaluations(evaluationsList);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const toggleIsShow = useCallback(
    async (examId, currentIsShow) => {
      setDisabled((prev) => ({ ...prev, [examId]: true }));
      try {
        const examDocRef = doc(
          db,
          `users/${adminId}/groups/${groupId}/exams`,
          examId
        );
        await updateDoc(examDocRef, { isShow: !currentIsShow });
        setExams((prevExams) =>
          prevExams.map((exam) =>
            exam.id === examId ? { ...exam, isShow: !currentIsShow } : exam
          )
        );
        toast({
          title: `${
            currentIsShow
              ? "Imtihon o'quvchilardan berkitildi"
              : "Imtihon o'quvchilarga ko'rinmoqda"
          }`,
        });
      } catch (err) {
        console.error("Error updating 'isShow':", err);
      } finally {
        setDisabled((prev) => ({ ...prev, [examId]: false }));
      }
    },
    [adminId, groupId]
  );

  useEffect(() => {
    fetchExams();
    fetchEvaluations();
  }, [adminId, groupId]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm) {
        const filtered = exams.filter((exam) =>
          exam.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredExams(filtered);
      } else {
        setFilteredExams(exams);
      }
    }, 300);

    return () => {
      clearTimeout(debounceRef.current);
    };
  }, [searchTerm, exams]);
  const sortedEvaluations = evaluations.sort(
    (a, b) => a.timestamp.seconds - b.timestamp.seconds
  );

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
        fetchExams={fetchExams}
      />

      <AddEvaluation
        open={openAddEvaluation}
        setOpen={setOpenAddEvaluation}
        groupId={groupId}
        groupStudents={groupStudents}
        fetch={fetchEvaluations}
      />

      <Tabs defaultValue="students" className="mt-4">
        <TabsList>
          <TabsTrigger value="students">O'quvchilar ro'yxati</TabsTrigger>
          <TabsTrigger className="hidden" value="attendance_check">
            Yo'qlamalar
          </TabsTrigger>
          <TabsTrigger className="hidden" value="tasks">
            Topshiriqlar
          </TabsTrigger>
          <TabsTrigger value="evaluation">Baholash</TabsTrigger>
          <TabsTrigger value="exams">Imtihonlar</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <StudentsDataTable data={groupStudents} loading={loadingStudents} />
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
                  https://chatgpt.com/c/672f877d-77e0-8001-aa7f-a3d17d7006cd{' '}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="tasks">tasks</TabsContent>
        <TabsContent value="evaluation">
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Input
                  className="peer pe-9 ps-9 w-full lg:w-96"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Oquvchini qidirish..."
                  type="search"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <Search size={16} strokeWidth={2} />
                </div>
              </div>
              <Button
                onClick={() => setOpenAddEvaluation(true)}
                variant="secondary"
                className="dark:bg-white dark:text-black"
              >
                Baholash
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg">
              <div className="inline-flex border border-border rounded-lg min-w-fit">
                <div className="flex-shrink-0 w-44 md:w-52 !sticky left-0 bg-muted dark:bg-background z-10 shadow">
                  <div className="font-medium text-sm p-4 border-b border-border">
                    Student's Name
                  </div>
                  {groupStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 text-sm border-b border-border whitespace-nowrap truncate bg-muted dark:bg-background"
                    >
                      {student.fullName}
                    </div>
                  ))}
                </div>

                <div className="flex overflow-x-auto rounded-r-lg">
                  {sortedEvaluations.map((evaluation) => {
                    function formatDate(timestamp) {
                      const { seconds, nanoseconds } = timestamp;
                      const date = new Date(
                        seconds * 1000 + nanoseconds / 1000000
                      );
                      return format(date, 'dd.MM.yy');
                    }
                    return (
                      <div key={evaluation.id} className="flex-shrink-0 group">
                        <div className="relative p-4 border-l border-border border-b bg-muted dark:bg-background">
                          <span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium group-hover:invisible">
                            {formatDate(evaluation.timestamp)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="invisible group-hover:visible"
                              asChild
                              aria-hidden="true"
                            >
                              <Button
                                variant="ghost"
                                className="flex h-[1.25rem] w-8 p-0 data-[state=open]:bg-muted rounded-sm"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="h-5 w-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                  />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[160px]"
                            >
                              <DropdownMenuItem
                                className="!text-sm"
                                onSelect={() => {
                                  // setOpenEdit(true);
                                  document.body.style.pointerEvents = '';
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="!text-sm"
                                onSelect={() => {
                                  // setOpenDelete(true);
                                  document.body.style.pointerEvents = '';
                                }}
                              >
                                Delete
                                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Student Scores */}
                        {groupStudents.map((student) => {
                          const studentScore =
                            evaluation.students.find((s) => s.id === student.id)
                              ?.score || '-';

                          return (
                            <div
                              key={student.id}
                              className={`flex items-center text-sm justify-center p-4 border-l border-b border-border font-bold`}
                            >
                              {studentScore}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="exams">
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Input
                  className="peer pe-9 ps-9 w-full lg:w-96"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Imtihonni qidirish..."
                  type="search"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <Search size={16} strokeWidth={2} />
                </div>
              </div>
              <Button
                onClick={() => setOpenAddExam(true)}
                variant="secondary"
                className="dark:bg-white dark:text-black"
              >
                Imtihon qo'shish
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-[50rem] w-full">
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
                    <TableHead>Is show</TableHead>
                    <TableHead className="rounded-tr-md text-center">
                      View
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow>
                      <Link to={`/groups/${groupId}/exam/${exam.id}`}>
                        <TableCell className="w-72">{exam?.title}</TableCell>
                      </Link>
                      <TableCell>{exam?.start}</TableCell>
                      <TableCell>{exam?.end}</TableCell>
                      <TableCell>{exam?.type}</TableCell>
                      <TableCell>{exam?.status}</TableCell>
                      <TableCell
                        className="flex items-center mt-2.5 gap-1.5"
                        title="O'quvchilarga ko'rsatish"
                      >
                        <Switch
                          key={exam?.id}
                          disabled={!!disabled[exam.id]}
                          checked={exam?.isShow}
                          onCheckedChange={() =>
                            toggleIsShow(exam?.id, exam?.isShow)
                          }
                        />
                        <Loader
                          className={`w-4 h-4 animate-spin ${
                            !!disabled[exam.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
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
