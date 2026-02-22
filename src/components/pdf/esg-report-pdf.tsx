import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0B1B32' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B1B32',
    marginTop: 16,
    marginBottom: 8,
  },
  badge: { fontSize: 9, padding: '3 8', borderRadius: 10 },
  badgeGreen: { backgroundColor: '#D1FAE5', color: '#065F46' },
  badgeRed: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#0B1B32', padding: '6 8' },
  tableHeaderText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: '5 8', borderBottom: '1 solid #E5E7EB' },
  tableRowAlt: { backgroundColor: '#F9FAFB' },
  tableCell: { fontSize: 9 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  infoItem: { width: '50%', marginBottom: 8 },
  infoLabel: { fontSize: 8, color: '#6B7280', marginBottom: 2 },
  infoValue: { fontSize: 10, color: '#111827' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#6B7280',
  },
})

export interface EsgReportPdfProps {
  propertyName: string
  carCode: string
  municipio: string | null
  uf: string | null
  areaImovel: number | null
  carStatus: string | null
  esgStatus: string | null
  totalApontamentos: number
  userName: string
  userCpfCnpj: string | null
  checkedAt: Date
  esgData: Record<string, unknown> | null
  layers: Array<{ key: string; label: string }>
  producerLayers?: Array<{ key: string; label: string }>
}

export function EsgReportPdf(props: EsgReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório Socioambiental</Text>
          <Text style={styles.subtitle}>{props.propertyName}</Text>
          <Text style={styles.subtitle}>
            Data: {props.checkedAt.toLocaleDateString('pt-BR')}
          </Text>
        </View>

        {/* Resumo Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text
            style={[
              styles.badge,
              props.totalApontamentos > 0 ? styles.badgeRed : styles.badgeGreen,
            ]}
          >
            {props.totalApontamentos > 0 ? 'Com apontamentos' : 'Sem apontamentos'}
          </Text>
        </View>

        {/* Dados do Fornecedor */}
        <Text style={styles.sectionTitle}>Dados do Fornecedor</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{props.userName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>CPF/CNPJ</Text>
            <Text style={styles.infoValue}>{props.userCpfCnpj ?? '-'}</Text>
          </View>
        </View>

        {/* Dados da Propriedade */}
        <Text style={styles.sectionTitle}>Dados da Propriedade</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Propriedade</Text>
            <Text style={styles.infoValue}>{props.propertyName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>CAR</Text>
            <Text style={styles.infoValue}>{props.carCode}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Município/UF</Text>
            <Text style={styles.infoValue}>
              {props.municipio ?? '-'}/{props.uf ?? '-'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Área (ha)</Text>
            <Text style={styles.infoValue}>
              {props.areaImovel?.toLocaleString('pt-BR') ?? '-'}
            </Text>
          </View>
        </View>

        {/* Apontamentos Table */}
        <Text style={styles.sectionTitle}>Apontamentos da Propriedade</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: '50%' }]}>
              Camada
            </Text>
            <Text style={[styles.tableHeaderText, { width: '25%' }]}>
              Apontamentos
            </Text>
            <Text style={[styles.tableHeaderText, { width: '25%' }]}>
              Status
            </Text>
          </View>
          {props.layers.map((layer, idx) => {
            const count = (props.esgData?.[layer.key] as number) ?? 0
            return (
              <View
                key={layer.key}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, { width: '50%' }]}>
                  {layer.label}
                </Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>{count}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: '25%' },
                    count > 0 ? { color: '#991B1B' } : { color: '#065F46' },
                  ]}
                >
                  {count > 0 ? 'Sim' : 'Sem apontamento'}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Apontamentos do Produtor */}
        {props.producerLayers && props.producerLayers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Apontamentos do Produtor</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: '50%' }]}>
                  Camada
                </Text>
                <Text style={[styles.tableHeaderText, { width: '25%' }]}>
                  Apontamentos
                </Text>
                <Text style={[styles.tableHeaderText, { width: '25%' }]}>
                  Status
                </Text>
              </View>
              {props.producerLayers.map((layer, idx) => {
                const count = (props.esgData?.[layer.key] as number) ?? 0
                return (
                  <View
                    key={layer.key}
                    style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                  >
                    <Text style={[styles.tableCell, { width: '50%' }]}>
                      {layer.label}
                    </Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{count}</Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: '25%' },
                        count > 0 ? { color: '#991B1B' } : { color: '#065F46' },
                      ]}
                    >
                      {count > 0 ? 'Sim' : 'Sem apontamento'}
                    </Text>
                  </View>
                )
              })}
            </View>
          </>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          AgroProdutor by MERX - Gerado em{' '}
          {new Date().toLocaleDateString('pt-BR')}
        </Text>
      </Page>
    </Document>
  )
}
