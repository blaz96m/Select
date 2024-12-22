import axios from "axios";

const axiosClient = axios.create();

axiosClient.defaults.headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMDBmZWUzOTE3Y2I0OWM3NTc4ZDE2NTdiNjY5OTBhYSIsIm5iZiI6MTcyMTQ4MTI0OS4xODkxNTksInN1YiI6IjY2OWJiNzQ3MjM4Zjc3NmMyNjA5OWUzYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zfw_WSDjH6HJVvYnJk4HHHp8B68gwZrdQ-f71r28ji4",
};

axiosClient.defaults.baseURL = "https://api.themoviedb.org/3";

export default axiosClient;
