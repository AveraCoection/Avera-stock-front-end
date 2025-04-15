import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import GlobalApiState from "../../utilis/globalVariable";

const ReportChart = ({ user }) => {
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [catalogues, setCatalogues] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCatalogeData = async () => {
    try {
      const response = await fetch(
        `${GlobalApiState.DEV_BASE_LIVE}/api/cataloge/list_cataloge/${user.user._id}`
      );
      const data = await response.json();
      setCatalogues(data);
      if (data.length > 0) {
        setSelectedCatalogId(data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching catalog data:", error);
    }
  };

  const fetchReport = async (type, setter) => {
    if (!selectedCatalogId) return;

    try {
      const response = await fetch(
        `${GlobalApiState.DEV_BASE_LIVE}/api/report/${selectedCatalogId}?type=${type}`
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const formatted = result.data.map((item) => ({
          name:
            type === "yearly"
              ? `${item._id.year}`
              : type === "monthly"
                ? `${item._id.month}/${item._id.year}`
                : `W${item._id.week}, ${item._id.year}`,
          design_number: item._id,
          totalPrice: item.price,
          totalKhazanaSold: item.totalKhazanaSold,
        }));
        setter(formatted);
      } else {
        setter([]);
      }
    } catch (error) {
      console.error(`Error fetching ${type} report:`, error);
      setter([]);
    }
  };

  useEffect(() => {
    fetchCatalogeData();
  }, []);

  useEffect(() => {
    if (selectedCatalogId) {
      setIsLoading(true);
      fetchReport("weekly", setWeeklyData);
      fetchReport("monthly", setMonthlyData);
      fetchReport("yearly", setYearlyData);
      setIsLoading(false);
    }
  }, [selectedCatalogId]);

  const renderChart = (data, title) => (
    <div className="mb-10">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>
      {data.length === 0 ? (
        <div className="text-gray-500">No data found.</div>
      ) : (
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <div
            style={{
              width: '100%',
              minWidth: `${Math.max(data.length * 100, 900)}px`,
              height: '300px',
              overflowX: 'auto', // Optional: enables scrolling if content overflows
            }}
          >


            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="design_number" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const total = data.totalPrice * data.totalKhazanaSold;
                      return (
                        <div className="bg-white border border-gray-300 p-3 rounded shadow-md text-sm">
                          <p><strong>Design:</strong> {data.design_number}</p>
                          <p><strong>Sold:</strong> Rs {total}</p>
                          <p><strong>Total Khazana:</strong> {data.totalKhazanaSold} meter</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar
                  dataKey="totalKhazanaSold"
                  name="Khazana Sold"
                  barSize={40}
                  fill="#10b981"
                  activeBar={{ fill: "#10b981" }} // Matches normal fill to make it look unhighlighted
                />

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


      )}
    </div>
  );

  return (
<div className="flex items-center justify-center w-full min-h-screen bg-gray-100">
  <div className="w-full max-w-5xl p-6 bg-white rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Catalogue Design Report</h2>

    <div className="flex items-center gap-4 mb-6">
      <label className="text-gray-700 font-medium">Catalogue:</label>
      <select
        value={selectedCatalogId}
        onChange={(e) => setSelectedCatalogId(e.target.value)}
        className="border border-gray-300 rounded-lg px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {catalogues.map((catalog) => (
          <option key={catalog._id} value={catalog._id}>
            {catalog.cataloge_number}
          </option>
        ))}
      </select>
    </div>

    {isLoading ? (
      <div className="text-center text-blue-600">Loading charts...</div>
    ) : (
      <>
        {renderChart(weeklyData, "Weekly Report")}
        {renderChart(monthlyData, "Monthly Report")}
        {renderChart(yearlyData, "Yearly Report")}
      </>
    )}
  </div>
</div>

  );
};

export default ReportChart;
