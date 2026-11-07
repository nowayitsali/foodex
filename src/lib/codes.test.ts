import { describe, expect, it } from 'vitest'
import { productCode } from './codes'

describe('productCode', () => {
  it('reads plain EAN and UPC numbers', () => {
    expect(productCode('3017620422003')).toBe('3017620422003')
    expect(productCode(' 012345678905 ')).toBe('012345678905')
    expect(productCode('96385074')).toBe('96385074')
  })
  it('reads GS1 Digital Link QR codes', () => {
    expect(productCode('https://id.gs1.org/01/03017620422003/10/ABC')).toBe('3017620422003')
    expect(productCode('https://brand.example/01/09506000134352?17=201225')).toBe('9506000134352')
  })
  it('reads Open Food Facts product links', () => {
    expect(productCode('https://world.openfoodfacts.org/product/3017620422003/nutella')).toBe('3017620422003')
  })
  it('ignores QR codes that are not products', () => {
    expect(productCode('https://example.com/menu')).toBeNull()
    expect(productCode('WIFI:S:cafe;T:WPA;P:secret;;')).toBeNull()
    expect(productCode('1234')).toBeNull()
  })
})
