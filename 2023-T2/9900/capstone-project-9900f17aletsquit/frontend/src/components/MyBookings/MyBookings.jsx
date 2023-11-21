import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Grid, Dialog, DialogTitle, DialogActions, Button } from '@mui/material';
import Rating from '@mui/material/Rating';
import { useNavigate } from 'react-router-dom';

function MyBookings ({ token }) {
  const [orders, setOrders] = useState([]);
  const [cancelOrderId, setCancelOrderId] = useState(null); // orderId of the order to be canceled
  const [carSpaceAddress, setCarSpaceAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders () {
    // Fetch orders data from the API
    const response = await fetch(`http://127.0.0.1:8800/order/orderSearch?customerId=${token}`, {
      method: 'GET',
      headers: {
        token: token,
      },
    });
    const data = await response.json();
    setOrders(data);

    // Fetch car space address for the first order (assuming each order has the same car space)
    if (data.length > 0) {
      fetchCarSpaceAddress(data[0].carSpaceId);
    }
  }

  async function fetchCarSpaceAddress (carSpaceId) {
    // Fetch car space address from the API using the carSpaceId
    const response = await fetch(`http://127.0.0.1:8800/carspace/query/${carSpaceId}`);
    const data = await response.json();
    setCarSpaceAddress(data.address);
  }

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleCancelOrder = async (orderId) => {
    setCancelOrderId(orderId); // Set the orderId of the order to be canceled
  };

  const handleDialogClose = () => {
    setCancelOrderId(null); // Reset the orderId when the dialog is closed
  };

  const handleConfirmCancelOrder = async () => {
    if (cancelOrderId) {
      try {
        const response = await fetch(`http://127.0.0.1:8800/order/deleteOrder?orderid=${cancelOrderId}`, {
          method: 'DELETE',
          headers: {
            token: token,
          },
        });
        const data = await response.text();
        console.log(data);
        alert(data);
      } catch (error) {
        console.error('Error while canceling order:', error);
      }
    }

    setCancelOrderId(null); // Reset the orderId after order cancellation is complete
  };

  const renderOrders = () => {
    return orders.map((order) => (
      <Grid item xs={4} key={order.orderId}>
        <Box marginBottom="20px">
          <Paper elevation={3} style={{ padding: '20px', height: '100%' }}>
            <Box display="flex" flexDirection="column" alignItems="center" height="100%">
              <Typography variant="h6" component="span">
                {carSpaceAddress}
              </Typography>
              <Box textAlign="center" mt={2} mb={1}>
                <Typography variant="body1" component="span">
                  Rental Dates:
                </Typography>
                <Typography variant="body1" component="span">
                  {formatDate(order.fromTime)} - {formatDate(order.toTime)}
                </Typography>
              </Box>
              <Box textAlign="center" mb={1}>
                <Typography variant="body1" component="span">
                  Payment Price:
                </Typography>
                <Typography variant="body1" component="span">
                  {order.sum}
                </Typography>
              </Box>

              {/* Other order details here */}

              <Rating name="order-rating" value={order.curRank} precision={0.5} readOnly /><br/>

              <Box display="flex" justifyContent="space-between" mt="auto">
                <Button
                  variant="contained"
                  color="primary"
                  style={{ margin: '0 10px' }}
                  onClick={() => {
                    navigate(`/bookingdetail/${order.orderId}`, { state: { order } });
                  }}
                >
                  View Details
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  style={{ margin: '0 10px' }}
                  onClick={() => handleCancelOrder(order.orderId)}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Grid>
    ));
  };

  return (
    <>
      <Box paddingTop="64px">
        <Grid container spacing={2}>
          {renderOrders()}
        </Grid>
      </Box>
      {/* Dialog to confirm order cancellation */}
      <Dialog open={Boolean(cancelOrderId)} onClose={handleDialogClose}>
        <DialogTitle>Confirm Order Cancellation</DialogTitle>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmCancelOrder} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyBookings;
