'use client'
import React from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { PictureAsPdf } from '@mui/icons-material'
import { ReservationWithDetails } from '@/types/reservation'
import {
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material'

interface PDFExportProps {
  reservation: ReservationWithDetails
  onExport?: () => void
}

const PDFExport: React.FC<PDFExportProps> = ({ reservation, onExport }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const generatePDF = async () => {
    try {
      // Create a temporary div for the invoice content
      const invoiceElement = document.createElement('div')
      invoiceElement.style.position = 'absolute'
      invoiceElement.style.left = '-9999px'
      invoiceElement.style.width = '148mm'
      invoiceElement.style.padding = '5mm'
      invoiceElement.style.fontFamily = 'Sarabun'
      invoiceElement.style.fontSize = '12px'
      invoiceElement.style.lineHeight = '1.4'
      invoiceElement.style.backgroundColor = 'white'
      
      // Calculate total days
      const checkIn = new Date(reservation.checkInDate)
      const checkOut = new Date(reservation.checkOutDate)
      const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      
      // Load logo image
      const logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'
      logoImg.src = '/assets/images/logos/logo-cchouse-2021.png'
      
      // Wait for logo to load
      await new Promise((resolve) => {
        logoImg.onload = resolve
        logoImg.onerror = resolve // Continue even if logo fails to load
      })
      
      // Load THSarabun font
      const fontLink = document.createElement('link')
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap'
      fontLink.rel = 'stylesheet'
      document.head.appendChild(fontLink)
      
      // Wait for font to load
      await new Promise((resolve) => {
        setTimeout(resolve, 1000) // Give time for font to load
      })
      
      // Format dates in Thai format
      const formatThaiDate = (date: Date) => {
        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear() + 543 // Convert to Buddhist Era
        return `${day} ${getThaiMonth(month)} ${year}`
      }
      
      const getThaiMonth = (month: number) => {
        const months = [
          'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
          'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ]
        return months[month - 1]
      }
      
      const getThaiMonthFull = (month: number) => {
        const months = [
          'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ]
        return months[month - 1]
      }
      
      const numberToThaiText = (num: number): string => {
        const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
        const tens = ['', '', 'ยี่', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
        const places = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']
        
        if (num === 0) return 'ศูนย์'
        
        const numStr = Math.floor(num).toString()
        let result = ''
        
        for (let i = 0; i < numStr.length; i++) {
          const digit = parseInt(numStr[i])
          const place = numStr.length - i - 1
          
          if (digit === 0) continue
          
          if (place === 1) { // tens place
            if (digit === 1) {
              result += 'สิบ'
            } else if (digit === 2) {
              result += 'ยี่สิบ'
            } else {
              result += ones[digit] + 'สิบ'
            }
          } else if (place === 0) { // ones place
            if (numStr.length > 1 && numStr[numStr.length - 2] !== '0' && digit === 1) {
              result += 'เอ็ด'
            } else {
              result += ones[digit]
            }
          } else {
            result += ones[digit] + places[place]
          }
        }
        
        return result + 'บาทถ้วน'
      }
      
      invoiceElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px; font-family: 'Sarabun';">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
               <div style="width: 100px;">เลขที่ ${reservation.number || 'N/A'} / 2568</div>
               <div style="flex: 1; display: flex; justify-content: center;">
                 <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                   <img src="${logoImg.src}" alt="Cool Cat House Logo" style="max-width: 80px; max-height: 80px; object-fit: contain;" onerror="this.style.display='none'" />
                 </div>
               </div>
               <div style="width: 100px; text-align: right;">เล่มที่ 2</div>
             </div>
          
          <h2 style="font-size: 25px; margin-bottom: 4px; font-weight: bold; font-family: 'Sarabun';">ครูแคทเฮาส์ (Cool Cat House)</h2>
          <div style="margin-bottom: 5px; font-family: 'Sarabun';">729 ซอยเทศบาล 5 หมู่ 7 ตำบลซับสมอทอด อำเภอบึงสามพัน จังหวัดเพชรบูรณ์ 67160</div>
          <div style="margin-bottom: 5px; font-family: 'Sarabun';">729 Moo 7, Soi Thetsaban 5, Tambon Sap Samo Thot, Amphur Bung Samphan, Phetchabun, 67160</div>
          <div style="margin-bottom: 20px; font-family: 'Sarabun';">เลขประจำตัวผู้เสียภาษี (Tax-ID) 3670800566253 โทรศัพท์ Tel. 08 2979 8991, 09 9708 7484</div>
          
          <h3 style="font-size: 25px; margin-bottom: 4px; font-weight: bold; font-family: 'Sarabun';">บิลเงินสด (Cash bill)</h3>
          <div style="font-size: 14px; margin-bottom: 20px; font-family: 'Sarabun';">${new Date().getDate()} ${getThaiMonthFull(new Date().getMonth() + 1)} ${new Date().getFullYear() + 543}</div>
        </div>
        
        <div style="margin-bottom: 20px; font-family: 'Sarabun';">
          <div style="display: flex; margin-bottom: 10px;">
            <div style="flex: 1; margin-right: 20px;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">นามลูกค้า / Name</div>
              <div style="font-size: 14px; text-align: left;">${reservation.customer?.name || 'N/A'}</div>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">เลขผู้เสียภาษี / Tax. ID.</div>
              <div style="font-size: 14px; text-align: left;">${reservation.customer?.taxId || 'N/A'}</div>
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">ที่อยู่ลูกค้า / Address</div>
            <div style="font-size: 14px; text-align: left;">${reservation.customer?.address || 'N/A'}</div>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; border-spacing: 0; margin-bottom: 20px; font-family: 'Sarabun'; font-size: 10px; table-layout: fixed;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border-left: 1px solid #333; border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 8%; white-space: nowrap;">ที่</th>
               <th style="border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 18%; white-space: nowrap;">รายการ</th>
               <th style="border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; white-space: nowrap;">วันที่เข้า</th>
               <th style="border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; white-space: nowrap;">วันที่ออก</th>
               <th style="border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 16%; white-space: nowrap;">ประเภทห้อง</th>
               <th style="border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 10%; white-space: nowrap;">จำนวนคืน</th>
               <th style="border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 10%; white-space: nowrap;">ราคาต่อคืน</th>
               <th style="border-top: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 10%; white-space: nowrap;">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            ${reservation.rooms && reservation.rooms.length > 0 
              ? reservation.rooms.map((room, index) => {
                  const roomPrice = room.room?.price || 0
                  const roomAmount = roomPrice * totalDays
                  return `
                    <tr style="height: 30px;">
                      <td style="border-left: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 8%; height: 30px; white-space: nowrap;">${index + 1}</td>
                      <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: left; width: 18%; height: 30px; white-space: nowrap;">ค่าที่พัก</td>
                      <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; height: 30px; white-space: nowrap;">${checkIn.getDate()} ${getThaiMonth(checkIn.getMonth() + 1)} ${checkIn.getFullYear() + 543}</td>
                      <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; height: 30px; white-space: nowrap;">${checkOut.getDate()} ${getThaiMonth(checkOut.getMonth() + 1)} ${checkOut.getFullYear() + 543}</td>
                      <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: left; width: 16%; height: 30px; white-space: nowrap;">${room.room?.name || 'ห้องพัก'}</td>
                      <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 10%; height: 30px; white-space: nowrap;">${totalDays}</td>
                      <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: right; width: 10%; height: 30px; white-space: nowrap;">${roomPrice.toFixed(2)}</td>
                      <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: right; width: 10%; height: 30px; white-space: nowrap;">${roomAmount.toFixed(2)}</td>
                    </tr>
                  `
                }).join('')
              : `
                <tr style="height: 30px;">
                  <td style="border-left: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 8%; height: 30px; white-space: nowrap;">1</td>
                  <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: left; width: 18%; height: 30px; white-space: nowrap;">ค่าที่พัก</td>
                  <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; height: 30px; white-space: nowrap;">${checkIn.getDate()} ${getThaiMonth(checkIn.getMonth() + 1)} ${checkIn.getFullYear() + 543}</td>
                  <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; height: 30px; white-space: nowrap;">${checkOut.getDate()} ${getThaiMonth(checkOut.getMonth() + 1)} ${checkOut.getFullYear() + 543}</td>
                  <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: left; width: 16%; height: 30px; white-space: nowrap;">ห้องพัก</td>
                  <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 10%; height: 30px; white-space: nowrap;">${totalDays}</td>
                  <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: right; width: 10%; height: 30px; white-space: nowrap;">${(reservation.totalAmount / totalDays).toFixed(2)}</td>
                  <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: right; width: 10%; height: 30px; white-space: nowrap;">${reservation.totalAmount.toFixed(2)}</td>
                </tr>
              `
            }
            ${Array.from({ length: Math.max(0, 4 - (reservation.rooms?.length || 1)) }, (_, i) => `
              <tr style="height: 30px;">
                <td style="border-left: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; width: 8%; height: 30px; white-space: nowrap;"></td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: left; width: 18%; height: 30px; white-space: nowrap;"></td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; height: 30px; white-space: nowrap;"></td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; height: 30px; white-space: nowrap;"></td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: left; width: 16%; height: 30px; white-space: nowrap;"></td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 10%; height: 30px; white-space: nowrap;"></td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: right; width: 10%; height: 30px; white-space: nowrap;"></td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: right; width: 10%; height: 30px; white-space: nowrap;"></td>
              </tr>
            `).join('')}
            ${reservation.extraBed ? `
              <tr style="height: 30px;">
                <td style="border-left: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 8%; height: 30px; white-space: nowrap;">${(reservation.rooms?.length || 0) + 1}</td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: left; width: 18%; height: 30px; white-space: nowrap;">เตียงเสริม</td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; height: 30px; white-space: nowrap;">${checkIn.getDate()} ${getThaiMonth(checkIn.getMonth() + 1)} ${checkIn.getFullYear() + 543}</td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 14%; height: 30px; white-space: nowrap;">${checkOut.getDate()} ${getThaiMonth(checkOut.getMonth() + 1)} ${checkOut.getFullYear() + 543}</td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: left; width: 16%; height: 30px; white-space: nowrap;">เตียงเสริม</td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; width: 10%; height: 30px; white-space: nowrap;">${totalDays}</td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: right; width: 10%; height: 30px; white-space: nowrap;">100.00</td>
                <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: right; width: 10%; height: 30px; white-space: nowrap;">${(100 * totalDays).toFixed(2)}</td>
              </tr>
            ` : ''}
             <tr style="background-color: #f0f0f0; font-weight: bold; height: 30px;">
               <td colspan="6" style="border-left: 1px solid #333; border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: center; height: 30px; white-space: nowrap;">${numberToThaiText(reservation.rooms && reservation.rooms.length > 0 
                 ? reservation.rooms.reduce((total, room) => total + ((room.room?.price || 0) * totalDays), 0) + (reservation.extraBed ? 100 * totalDays : 0)
                 : reservation.totalAmount)}</td>
               <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: left; width: 10%; height: 30px; white-space: nowrap;">รวมเงิน</td>
               <td style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; text-align: right; height: 30px; white-space: nowrap;">${reservation.rooms && reservation.rooms.length > 0 
                 ? (reservation.rooms.reduce((total, room) => total + ((room.room?.price || 0) * totalDays), 0) + (reservation.extraBed ? 100 * totalDays : 0)).toFixed(2)
                 : reservation.totalAmount.toFixed(2)}</td>
             </tr>
          </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 60px; font-family: 'Sarabun';">
          <div style="font-weight: bold;">ผู้รับเงิน</div>
          <div style="margin-top: 4px;">${formatThaiDate(new Date())}</div>
        </div>
      `
      
      document.body.appendChild(invoiceElement)
      
      // Generate canvas from the element
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Remove the temporary element
      document.body.removeChild(invoiceElement)
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 148 // A5 width in mm
      const pageHeight = 210 // A5 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Save the PDF
      const fileName = `invoice_${reservation.id?.substring(0, 8) || 'reservation'}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      if (onExport) {
        onExport()
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง')
    }
  }
  
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<PictureAsPdf />}
      onClick={generatePDF}
      fullWidth={isMobile}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 'medium',
        px: 3,
        py: 1
      }}
      
    >
      PDF
    </Button>
  )
}

export default PDFExport