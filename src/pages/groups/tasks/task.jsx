import { useCallback, useEffect, useState } from 'react';
import { db } from '@/api/firebase';
import BreadcrumbComponent from '@/components/breadcrumb';
import AddQuestion from '@/components/groups/exam/add-question';
import ExamHeader from '@/components/groups/exam/exam-header';
import Questions from '@/components/groups/exam/questions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useMainContext } from '@/context/main-context';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { Loader, Paperclip, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import TaskHeader from '@/components/groups/tasks/task-header';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import TaskChat from '@/components/groups/tasks/chat';
import { Skeleton } from '@/components/ui/skeleton';

const GroupTask = () => {
  const { adminId, teacherData } = useMainContext();
  const { groupId, taskId } = useParams();

  const { groups, courses } = useMainContext();
  const group = groups.find((g) => g.id === groupId);

  const [tasks, setTasks] = useState([]);
  const [groupStudents, setGroupStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const task = tasks.find((ex) => ex.id === taskId);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const ref = collection(db, `users/${adminId}/groups/${groupId}/tasks`);
      const querySnapshot = await getDocs(ref);

      const tasksList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(tasksList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupStudents = useCallback(async () => {
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
    }
  }, [adminId, groupId]);

  useEffect(() => {
    fetchTasks();
    fetchGroupStudents();
  }, [adminId, groupId]);

  useEffect(() => {
    const chatRef = collection(
      db,
      `users/${adminId}/groups/${groupId}/tasks/${taskId}/chat`
    );
    const q = query(chatRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [taskId, groupId, adminId]);

  if (!group && loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="space-y-5">
          <Skeleton className="h-4 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-72" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/3" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
        </div>

        <div className="relative border border-border rounded-md my-2 h-[70vh] animate-pulse">
          <div className="w-full p-4 bg-muted rounded-t-md">
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-1/2 mg-muted rounded"></div>
              <div className="h-3 w-1/4 mg-muted rounded"></div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-120px)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 mt-4">
      <BreadcrumbComponent
        title="Guruhlar ro'yxati"
        titleLink="/groups"
        subtitle={`${
          courses.filter((item) => item.id === group.courseId)[0]?.courseTitle
        } #${group?.groupNumber}`}
        subtitleLink={`/groups/${groupId}`}
        subtitle2={`${task?.title} (task)`}
      />
      <TaskHeader task={task} loading={loading} messages={messages} />

      {/* Chat */}

      <TaskChat
        task={task}
        groupStudents={groupStudents}
        groupId={groupId}
        taskId={taskId}
        messages={messages}
      />
    </div>
  );
};

export default GroupTask;
