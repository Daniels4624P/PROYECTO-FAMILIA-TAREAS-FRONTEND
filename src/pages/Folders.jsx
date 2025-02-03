import { useState, useEffect } from "react";
import { createFolder, getPublicFolders, getPrivateFolders, deleteFolder } from "../utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

function Folders() {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isPublic, setIsPublic] = useState(true); // Controla la visibilidad

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const publicFolders = await getPublicFolders();
      const privateFolders = await getPrivateFolders();
      setFolders([...publicFolders.data, ...privateFolders.data]);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      // Enviamos 'public' en el JSON, no 'isPublic'
      await createFolder({ name: newFolderName, public: isPublic });
      setNewFolderName("");
      setIsPublic(true);
      fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDeleteFolder = async (id) => {
    try {
      await deleteFolder(id);
      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  return (
    <Card className="w-[400px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>Folders</CardTitle>
        <CardDescription>Manage your folders</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              type="text"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              required
            />
          </div>

          {/* Selector para visibilidad */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={isPublic ? "public" : "private"} onValueChange={(value) => setIsPublic(value === "public")}>
              <SelectTrigger id="visibility">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CardFooter>
            <Button type="submit" className="w-full">
              Create Folder
            </Button>
          </CardFooter>
        </form>

        <ul className="mt-4 space-y-2">
          {folders.map((folder) => (
            <li key={folder.id} className="flex justify-between items-center p-2 border rounded-md">
              <div>
                <span className="font-semibold">{folder.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({folder.public ? "Public" : "Private"})
                </span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteFolder(folder.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default Folders;
