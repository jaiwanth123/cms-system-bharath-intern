import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Pagination from "../components/Pagination";
import AcceptUserModal from "../components/modals/AcceptUserModal";
import RejectUserModal from "../components/modals/RejectUserModal";
import useContent from "../hooks/useContent";
import timeSince from "../helper/timeSince";
import UserDetailsModal from "../components/modals/UserDetailsModal";
import Loading from "../components/Loading";

const RequestHandler = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const userPerPage = 4;
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { changed } = useContent();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        const response = await axiosPrivate.get("/manageuser", {
          signal: controller.signal,
        });
        const filterData = response.data.filter((user) =>
          user.isApproved === "Pending" ? true : false
        );
        isMounted && setUsers(filterData);
      } catch (err) {
        console.error(err);
      }
    };
    getUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [axiosPrivate, location, navigate, changed]);

  useEffect(() => {
    let timer;
    if (search && users) {
      timer = setTimeout(() => {
        setFilteredData(
          users.filter((item) =>
            item.username.toLowerCase().includes(search.toLowerCase())
          )
        );
      }, 500);
    } else {
      setFilteredData(undefined);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [users, search]);

  let lastPostIndex = currentPage * userPerPage;
  let firstPostIndex = lastPostIndex - userPerPage;

  let currentUsers;
  if (!filteredData) {
    currentUsers = users.slice(firstPostIndex, lastPostIndex);
  } else {
    currentUsers = filteredData.slice(firstPostIndex, lastPostIndex);
  }

  return !users ? (
    <Loading />
  ) : (
    <section className="container px-4 mx-auto">
      <div className="flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border  border-gray-700 md:rounded-lg">
              <div className="p-4">
                <label htmlFor="table-search" className="sr-only">
                  Search
                </label>
                <div className="flex justify-start mt-1">
                  <input
                    type="text"
                    id="table-search"
                    className=" border text-sm rounded-lg block w-72  p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search for items"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-700">
                <thead className=" bg-gray-900">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-400"
                    >
                      <div className="flex items-center gap-x-3">
                        <button className="flex items-center gap-x-2">
                          <span>Username</span>
                        </button>
                      </div>
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-400"
                    >
                      Date
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-400"
                    >
                      Status
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-400"
                    >
                      Email
                    </th>

                    <th scope="col" className="relative py-3.5 px-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-secondary-dark-bg">
                  {currentUsers?.length ? (
                    currentUsers.map((user, i) => (
                      <tr key={user._id}>
                        <td className="px-4 py-4 text-sm font-medium text-gray-200 whitespace-nowrap">
                          <div className="inline-flex items-center gap-x-3">
                            <span>{user.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                          {!user.createdAt ? "" : timeSince(user.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                          <div className="inline-flex items-center px-3 py-1 text-gray-500 rounded-full gap-x-2 bg-gray-800">
                            {/*svg for pending */}
                            <svg
                              width="12"
                              height="12"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M6.5 7h11"></path>
                              <path d="M6.5 17h11"></path>
                              <path d="M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1Z"></path>
                              <path d="M6 4v2a6 6 0 1 0 12 0V4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v0Z"></path>
                            </svg>

                            <h2 className="text-sm font-normal">Pending</h2>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm  text-gray-300 whitespace-nowrap">
                          <div className="flex items-center gap-x-2">
                            <div>
                              <p className="text-sm font-normal text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          <div className="flex items-center gap-x-6">
                            <AcceptUserModal username={user.username} />
                            <RejectUserModal username={user.username} />
                            <UserDetailsModal user={user} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-white">
                      <td colSpan={5} className="text-center py-4">
                        <p>No Users to display</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Pagination
        totalPosts={filteredData ? filteredData.length : users.length}
        postsPerPage={userPerPage}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
      />
    </section>
  );
};

export default RequestHandler;
