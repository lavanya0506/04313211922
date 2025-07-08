import React from "react";
import { AppBar, Toolbar, Typography, Container, Divider } from "@mui/material";
import { CreateShortUrl } from "./components/CreateShortUrl";
import { Statistics } from "./components/Statistics";

function App() {
  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <Typography variant="h6" component="div">
            URL SHORTENER
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ backgroundColor: "#ffffff", minHeight: "100vh", py: 4 }}>
        <CreateShortUrl />
        <Divider sx={{ my: 4 }} />
        <Statistics />
      </Container>
    </>
  );
}

export default App;
