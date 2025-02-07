import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Loader from "../components/Loader";
import { fetchTasksForMonth } from "../utils/api";

function TasksChart({ userId }) {
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchTasksForMonth(userId, { year: selectedYear, month: selectedMonth });
        const formattedData = response.data.map((task) => ({
          day: new Date(task.day).getDate(),
          taskCount: task.taskCount,
        }));
        setTasksData(formattedData);
      } catch (error) {
        console.error("Error fetching tasks data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, selectedMonth, selectedYear]);

  return (
    <Card className="bg-notion-bg dark:bg-notion-dark">
      <CardHeader>
        <CardTitle className="text-notion-text dark:text-notion-text-dark">Tasks per Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Select onValueChange={setSelectedYear} value={selectedYear}>
            <SelectTrigger className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedMonth} value={selectedMonth}>
            <SelectTrigger className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <Loader size="large" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tasksData}>
              <XAxis dataKey="day" stroke="#8884d8" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="taskCount" fill="#ff7043" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default TasksChart;
