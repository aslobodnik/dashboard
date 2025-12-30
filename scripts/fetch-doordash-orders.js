/**
 * DoorDash Order Fetcher
 *
 * Run this in the browser console while logged into doordash.com,
 * or execute via Claude's javascript_tool on a DoorDash tab.
 *
 * The browser session cookies handle authentication automatically.
 */

async function fetchAllDoorDashOrders() {
  const GRAPHQL_URL = 'https://www.doordash.com/graphql/getConsumerOrdersWithDetails?operation=getConsumerOrdersWithDetails';

  const query = `query getConsumerOrdersWithDetails($offset: Int!, $limit: Int!, $includeCancelled: Boolean, $orderFilterType: OrderFilterType) {
    getConsumerOrdersWithDetails(
      offset: $offset
      limit: $limit
      includeCancelled: $includeCancelled
      orderFilterType: $orderFilterType
    ) {
      id
      orderUuid
      createdAt
      submittedAt
      fulfilledAt
      isPickup
      isGroup
      grandTotal {
        unitAmount
        currency
        decimalPlaces
        displayString
      }
      store {
        id
        name
      }
      orders {
        items {
          id
          name
          quantity
        }
      }
    }
  }`;

  const allOrders = [];
  let offset = 0;
  const limit = 50; // Fetch 50 at a time
  let hasMore = true;

  console.log('Fetching DoorDash orders...');

  while (hasMore) {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
      body: JSON.stringify({
        operationName: 'getConsumerOrdersWithDetails',
        variables: {
          offset,
          limit,
          includeCancelled: false,
          orderFilterType: 'ORDER_FILTER_TYPE_UNSPECIFIED'
        },
        query
      })
    });

    const data = await response.json();
    const orders = data?.data?.getConsumerOrdersWithDetails || [];

    if (orders.length === 0) {
      hasMore = false;
    } else {
      allOrders.push(...orders);
      offset += limit;
      console.log(`Fetched ${allOrders.length} orders so far...`);

      // Stop if we got fewer than limit (last page)
      if (orders.length < limit) {
        hasMore = false;
      }
    }
  }

  console.log(`Total orders fetched: ${allOrders.length}`);
  return allOrders;
}

/**
 * Transform DoorDash API response to our orders.json format
 */
function transformOrders(apiOrders) {
  return apiOrders.map(order => {
    // Parse timestamp
    const timestamp = order.submittedAt || order.createdAt;
    const date = new Date(timestamp);

    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = date.toTimeString().slice(0, 5);   // HH:MM

    // Calculate total items
    const itemCount = order.orders?.reduce((sum, o) => {
      return sum + (o.items?.reduce((s, item) => s + (item.quantity || 1), 0) || 0);
    }, 0) || 0;

    // Get total (unitAmount is in cents)
    const totalCents = order.grandTotal?.unitAmount || 0;
    const total = totalCents / 100;

    return {
      date: dateStr,
      time: timeStr,
      restaurant: order.store?.name || 'Unknown',
      total: Math.round(total * 100) / 100, // Round to 2 decimal places
      items: itemCount,
      type: order.isPickup ? 'pickup' : 'delivery'
    };
  });
}

/**
 * Main function - fetch and transform
 */
async function getDoorDashData() {
  const rawOrders = await fetchAllDoorDashOrders();
  const transformed = transformOrders(rawOrders);

  // Sort by date descending (newest first)
  transformed.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });

  const output = {
    lastUpdated: new Date().toISOString().split('T')[0],
    orders: transformed
  };

  console.log('=== ORDERS JSON ===');
  console.log(JSON.stringify(output, null, 2));

  return output;
}

// Run it
getDoorDashData();
