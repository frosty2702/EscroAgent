import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Grid from '@mui/material/Grid';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-10 px-2">
      {/* Header */}
      <Typography variant="h3" className="text-white font-bold text-center mb-2" style={{ fontWeight: 800 }}>
        Decentralized Escrow & Conditional Payments
      </Typography>
      <Typography variant="subtitle1" className="text-gray-300 text-center mb-8 max-w-2xl">
        Wallets that act automatically based on preset rules or data for trustless conditional payments.
      </Typography>

      {/* Wallet Status */}
      <Card className="w-full max-w-3xl mb-6">
        <CardContent className="flex flex-row justify-between items-center">
          <span className="text-gray-500">Wallet Status: <span className="text-gray-400">Not Connected</span></span>
          <Button variant="contained" color="primary" className="!font-bold">CONNECT WALLET</Button>
        </CardContent>
      </Card>

      {/* Create New Agreement */}
      <Card className="w-full max-w-3xl mb-6">
        <CardContent>
          <Typography variant="h6" className="font-bold mb-4">Create New Agreement</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField label="Payer CDP Wallet Address" fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Payee CDP Wallet Address" fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Amount (ETH)" fullWidth size="small" />
            </Grid>
            <Grid item xs={2} sm={1} className="flex justify-center">
              <IconButton color="primary" aria-label="swap">
                <AutorenewIcon />
              </IconButton>
            </Grid>
            <Grid item xs={10} sm={8}>
              <TextField
                label="Agreement Description"
                fullWidth
                multiline
                minRows={3}
                placeholder="e.g., 'Loan of 0.1 ETH due in 30 days' or 'Payment for website design upon completion of milestone 1'"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" color="primary" fullWidth className="!font-bold h-full">
                CREATE AGREEMENT
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Active Agreements */}
      <Card className="w-full max-w-3xl">
        <CardContent>
          <Typography variant="h6" className="font-bold mb-2">Active Agreements</Typography>
          {/* Agreement list will go here */}
        </CardContent>
      </Card>
    </div>
  );
}
