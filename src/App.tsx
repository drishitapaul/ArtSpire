import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const App = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMap, setSelectedMap] = useState<{ [id: number]: Artwork }>({});
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 10;

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`);
      const data = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const onPageChange = (e: DataTableStateEvent) => {
    if (typeof e.page === 'number') {
      setCurrentPage(e.page + 1);
    }
  };

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const updatedMap: { [id: number]: Artwork } = { ...selectedMap };
    
    // Add newly selected
    e.value.forEach((item) => {
      updatedMap[item.id] = item;
    });

    // Remove deselected
    Object.keys(selectedMap).forEach((id) => {
      if (!e.value.find((row) => row.id === Number(id))) {
        delete updatedMap[Number(id)];
      }
    });

    setSelectedMap(updatedMap);
  };

  const header = (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold text-[#0e3b43]">Art Gallery</h2>
      <img src="/assets/logo.png" alt="Logo" className="h-16" />
    </div>
  );

  return (
    <div className="p-4 bg-[#edf2ef] min-h-screen">
      {header}

      <DataTable
        value={artworks}
        loading={loading}
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        lazy
        dataKey="id"
        selection={Object.values(selectedMap)}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
        first={(currentPage - 1) * rowsPerPage}
        onPage={onPageChange}
        paginatorTemplate="PrevPageLink PageLinks NextPageLink CurrentPageReport RowsPerPageDropdown JumpToPageInput"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        rowsPerPageOptions={[10, 20, 50]}
        responsiveLayout="scroll"
        className="shadow rounded bg-white"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      {/* 💡 Selected Rows Panel */}
      <div className="mt-4 p-4 bg-white shadow rounded">
        <h3 className="text-lg font-semibold text-gray-700">
          Selected Artworks: {Object.keys(selectedMap).length}
        </h3>
        <ul className="list-disc ml-5 mt-2 text-sm text-gray-600">
          {Object.values(selectedMap).map((art) => (
            <li key={art.id}>{art.title} — {art.artist_display}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
