import React, { useState } from "react";
import { TextField, Button, Box, Typography, Alert, Table, TableHead, TableRow, TableCell, TableBody, Link } from "@mui/material";
import axios from "axios";

interface Interaction {
  timestamp: string;
  referrer: string;
  ip: string;
}

interface StatisticsResponse {
  shortcode: string;
  target_url: string;
  created_at: string;
  expiry_at: string;
  total_clicks: number;
  interactions: Interaction[];
}

export const Statistics: React.FC = () => {
  const [shortcode, setShortcode] = useState("");
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setError(null);
    setStats(null);

    try {
      const res = await axios.get(`http://localhost:3000/shorturls/${shortcode}`);
      setStats(res.data);
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        setError("Error fetching statistics");
      }
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 4,
        backgroundColor: "#ffffff",
        p: 3,
        borderRadius: 1,
        border: "1px solid #ddd"
      }}
    >
      <Typography variant="h5" gutterBottom>
        Retrieve Statistics
      </Typography>
      <TextField
        label="Shortcode"
        fullWidth
        margin="normal"
        value={shortcode}
        onChange={(e) => setShortcode(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleFetch}
        sx={{ mt: 2 }}
      >
        Fetch Statistics
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {stats && (
        <Box sx={{ mt: 2 }}>
          <Typography>Target URL: <Link href={stats.target_url} target="_blank">{stats.target_url}</Link></Typography>
          <Typography>Created At: {stats.created_at}</Typography>
          <Typography>Expiry At: {stats.expiry_at}</Typography>
          <Typography>Total Clicks: {stats.total_clicks}</Typography>

          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Referrer</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.interactions.map((i, index) => (
                <TableRow key={index}>
                  <TableCell>{i.timestamp}</TableCell>
                  <TableCell>{i.referrer}</TableCell>
                  <TableCell>{i.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};
