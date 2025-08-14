import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer';

import logo from '../assets/black_logo.png';

// ✅ Roboto fontunu kaydet
Font.register({
  family: 'Roboto',
  src: require('../fonts/Roboto-Regular.ttf'),
});

// ✅ Stil ayarları
const styles = StyleSheet.create({
  page: {
    padding: 14, 
    paddingTop: 10,
    fontSize: 9,
    fontFamily: 'Roboto',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  orderNumberContainer: {
    textAlign: 'right',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  orderNumberLabel: {
    fontSize: 9,
    color: '#666',
    marginRight: 2,
  },
  orderNumberValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  infoSection: {
    border: '0.5pt solid #ccc',
    padding: 4,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1, // Reduced from 2
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
  },
  value: {
    width: '60%',
    textAlign: 'right',
  },
  table: {
    width: '100%',
    marginTop: 4,
    border: '0.5pt solid #000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderBottom: '0.5pt solid #000',
    paddingVertical: 2,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ccc',
    paddingVertical: 2,
  },
  colCode: { width: '18%', paddingHorizontal: 4 },
  colName: { width: '32%', paddingHorizontal: 4 },
  colQty: { width: '12%', paddingHorizontal: 4, textAlign: 'center' },
  colPrice: { width: '18%', paddingHorizontal: 4, textAlign: 'right' },
  colTotal: { width: '20%', paddingHorizontal: 4, textAlign: 'right' },

  totalSection: {
    marginTop: 8, // Reduced from 10
    alignItems: 'flex-end',
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    fontSize: 10,
    marginBottom: 2,
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
    borderTop: '1pt solid #000',
    paddingTop: 4,
  }
});

// Helper function to format numbers in Turkish format
const formatNumber = (number) => {
  // Ensure we're working with a number
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  // Format with 2 decimal places, replace dot with comma, and add thousands separator
  return num
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// ✅ PDF bileşeni
const InvoicePDF = ({ order }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      
      {/* Üst Alan (Logo + Sipariş No) */}
      <View style={styles.header}>
        <Image src={logo} style={styles.logoImage} />
        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumberLabel}>Sipariş No:</Text>
          <Text style={styles.orderNumberValue}>{order.id}</Text>
        </View>
      </View>

      {/* Sipariş Bilgileri */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Firma:</Text>
          <Text style={styles.value}>{order.company_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Sipariş Tarihi:</Text>
          <Text style={styles.value}>{order.created_at.split('T')[0]}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Teslim Tarihi:</Text>
          <Text style={styles.value}>{order.delivery_date}</Text>
        </View>
      </View>

      {/* Ürün Tablosu */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colCode}>Kod</Text>
          <Text style={styles.colName}>Ürün</Text>
          <Text style={styles.colQty}>Adet</Text>
          <Text style={styles.colPrice}>Birim</Text>
          <Text style={styles.colTotal}>Tutar</Text>
        </View>

        {order.items.map(item => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colName}>{item.product_name || item.name}</Text>
            <Text style={styles.colCode}>{item.product_code || item.code}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{formatNumber(item.unit_price)}₺</Text>
            <Text style={styles.colTotal}>
              {formatNumber(item.quantity * item.unit_price)}₺
            </Text>
          </View>
        ))}
      </View>

      {/* Toplamlar */}
      <View style={styles.totalSection}>
        <View style={styles.totalLine}>
          <Text>Ara Toplam:</Text>
          <Text>{formatNumber(order.subtotal)}₺</Text>
        </View>
        <View style={styles.totalLine}>
          <Text>İskonto:</Text>
          <Text>{formatNumber(order.discount_amount)}₺</Text>
        </View>
        <View style={styles.totalLine}>
          <Text>KDV ({order.vat_rate}%):</Text>
          <Text>{formatNumber(order.vat_amount)}₺</Text>
        </View>
        <View style={styles.grandTotal}>
          <Text>Genel Toplam: {formatNumber(order.total)}₺</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
