import React, { useState } from "react";
import { TextField, Button, Box, Typography, Alert, Link } from "@mui/material";
import axios from "axios";

export const CreateShortUrl: React.FC = () => {
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState(60);
  const [shortcode, setShortcode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setMessage(null);
    setError(null);

    try {
      await axios.post("http://localhost:3000/shorturls", {
        url,
        validity,
        shortcode
      });
      setMessage(`http://localhost:3000/${shortcode}`);
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        setError("Error creating short URL");
      }
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 4,
        backgroundColor: "#ffffff",
        p: 3,
        borderRadius: 1,
        border: "1px solid #ddd"
      }}
    >
      <Typography variant="h5" gutterBottom>
        Create Short URL
      </Typography>
      <TextField
        label="Long URL"
        fullWidth
        margin="normal"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <TextField
        label="Validity (seconds)"
        type="number"
        fullWidth
        margin="normal"
        value={validity}
        onChange={(e) => {
          const val = e.target.value;
          setValidity(val === "" ? 0 : parseInt(val));
        }}
      />
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
        onClick={handleSubmit}
        sx={{ mt: 2 }}
      >
        Create
      </Button>
      {message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Short URL created:&nbsp;
          <Link
            href={message}
            target="_blank"
            rel="noopener"
          >
            {message}
          </Link>
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};
