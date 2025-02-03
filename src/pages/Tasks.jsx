import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createTask, getFolderTasks, completeTask, getPrivateFolders, getPublicFolders } from "../utils/api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [publicFolders, setPublicFolders] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchTasks(selectedFolder);
      checkFolderPublicStatus(selectedFolder);
    } else {
      setTasks([]);
    }
  }, [selectedFolder]);

  const fetchFolders = async () => {
    try {
      const publicFoldersData = await getPublicFolders();
      const privateFoldersData = await getPrivateFolders();
      setPublicFolders(publicFoldersData.data.map(folder => folder.id));
      setFolders([...publicFoldersData.data, ...privateFoldersData.data]);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const fetchTasks = async (folderId) => {
    setLoadingTasks(true);
    try {
      const response = await getFolderTasks(folderId);
      setTasks(response.data.tasks.length ? response.data.tasks : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const checkFolderPublicStatus = (folderId) => {
    setIsPublic(publicFolders.includes(folderId));
  };

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        folderId: selectedFolder,
        public: isPublic,
        points: isPublic ? (data.points ? Number.parseInt(data.points, 10) : 0) : null,
      };

      const token = localStorage.getItem("token");
      await createTask(taskData, token);
      reset();
      fetchTasks(selectedFolder);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Obtener el token del usuario
      await completeTask(id, token); // Pasar el token en la solicitud
      fetchTasks(selectedFolder);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedFolder} value={selectedFolder}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a folder" />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedFolder && (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Task Name</Label>
                  <Input id="name" {...register("task", { required: "Task name is required" })} />
                  {errors.task && <p className="text-sm text-red-500">{errors.task.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" {...register("description")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input id="points" type="number" {...register("points", { min: 0 })} disabled={!isPublic} />
                </div>

                <Button type="submit">Create Task</Button>
              </form>

              {loadingTasks ? (
                <p className="text-center mt-4">Loading tasks...</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <Card key={task.id}>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-semibold">{task.task}</h3>
                          <p className="text-sm">Points: {task.points}</p>
                          <p className="text-sm">Status: {task.completed ? "Completed" : "Pending"}</p>
                          <Button onClick={() => handleCompleteTask(task.id)} className="mt-2" disabled={task.completed}>
                            {task.completed ? "Task Completed" : "Complete Task"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No tasks available</p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Tasks;
