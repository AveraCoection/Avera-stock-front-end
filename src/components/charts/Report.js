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
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogeData();
  }, []);

  useEffect(() => {
    if (selectedCatalogId) {
      fetchReport("weekly", setWeeklyData);
      fetchReport("monthly", setMonthlyData);
      fetchReport("yearly", setYearlyData);
    }
  }, [selectedCatalogId]);

  const renderChart = (data, title) => (
    <div className="mb-10">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <div
          style={{
            width: '100%',
            minWidth: `${Math.max(data.length * 100, 800)}px`,
            height: '300px',
            overflowX: 'auto',
            position: 'relative',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.length === 0 ? [{ design_number: '', totalKhazanaSold: 0 }] : data}
              margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="design_number" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length && data.length !== 0) {
                    const item = payload[0].payload;
                    const total = item.totalPrice * item.totalKhazanaSold;
                    return (
                      <div className="bg-white border border-gray-300 p-3 rounded shadow-md text-sm">
                        <p><strong>Design:</strong> {item.design_number}</p>
                        <p><strong>Sold:</strong> Rs {total}</p>
                        <p><strong>Total Khazana:</strong> {item.totalKhazanaSold} meter</p>
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
                activeBar={{ fill: "#10b981" }}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Display message on top of chart if no data */}
          {data.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 text-blue-600 text-[24px] font-medium">
              No Record Found
            </div>
          )}
        </div>
      </div>
    </div>

  );

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center mb-12 w-full min-h-screen bg-gray-100">
      <div className="w-full max-w-5xl p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center ">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Catalogue Design Report</h2>

          <div className="flex items-center gap-4 mb-6">
            <label className="text-green-700 font-medium">Catalogue:</label>
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
        </div>


        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-700"></div>
          </div>
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
