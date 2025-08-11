const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Function to read CSV file and return parsed data
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Function to add room via API
async function addRoom(roomData) {
  try {
    const response = await fetch('http://localhost:3000/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create room');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding room:', error.message);
    throw error;
  }
}

// Function to add customer via API
async function addCustomer(customerData) {
  try {
    const response = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create customer');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding customer:', error.message);
    throw error;
  }
}

// Main function to import data
async function importData() {
  try {
    console.log('🚀 เริ่มต้นการนำเข้าข้อมูล...');
    
    // Import rooms
    console.log('📋 กำลังอ่านข้อมูลห้องพักจาก rooms.csv...');
    const roomsPath = path.join(__dirname, '..', 'rooms.csv');
    const roomsData = await readCSV(roomsPath);
    
    console.log(`📊 พบข้อมูลห้องพัก ${roomsData.length} รายการ`);
    
    let roomsAdded = 0;
    let roomsSkipped = 0;
    
    for (const room of roomsData) {
      try {
        const roomData = {
          name: room.name,
          price: parseFloat(room.price)
        };
        
        await addRoom(roomData);
        roomsAdded++;
        console.log(`✅ เพิ่มห้องพัก: ${room.name} (${room.price} บาท)`);
      } catch (error) {
        roomsSkipped++;
        console.log(`⚠️  ข้ามห้องพัก: ${room.name} - ${error.message}`);
      }
    }
    
    // Import customers
    console.log('\n📋 กำลังอ่านข้อมูลลูกค้าจาก users_no_id_date.csv...');
    const customersPath = path.join(__dirname, '..', 'users_no_id_date.csv');
    const customersData = await readCSV(customersPath);
    
    console.log(`📊 พบข้อมูลลูกค้า ${customersData.length} รายการ`);
    
    let customersAdded = 0;
    let customersSkipped = 0;
    
    for (const customer of customersData) {
      try {
        const customerData = {
          name: customer.name,
          address: customer.address,
          taxId: customer.taxId
        };
        
        await addCustomer(customerData);
        customersAdded++;
        console.log(`✅ เพิ่มลูกค้า: ${customer.name}`);
      } catch (error) {
        customersSkipped++;
        console.log(`⚠️  ข้ามลูกค้า: ${customer.name} - ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n🎉 สรุปผลการนำเข้าข้อมูล:');
    console.log(`📦 ห้องพัก: เพิ่มสำเร็จ ${roomsAdded} รายการ, ข้าม ${roomsSkipped} รายการ`);
    console.log(`👥 ลูกค้า: เพิ่มสำเร็จ ${customersAdded} รายการ, ข้าม ${customersSkipped} รายการ`);
    console.log('✨ การนำเข้าข้อมูลเสร็จสิ้น!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการนำเข้าข้อมูล:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/rooms');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Run the import
async function main() {
  console.log('🔍 ตรวจสอบการเชื่อมต่อเซิร์ฟเวอร์...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่ที่ http://localhost:3000');
    console.log('💡 เรียกใช้คำสั่ง: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ เซิร์ฟเวอร์พร้อมใช้งาน');
  await importData();
}

if (require.main === module) {
  main();
}

module.exports = { importData, addRoom, addCustomer };