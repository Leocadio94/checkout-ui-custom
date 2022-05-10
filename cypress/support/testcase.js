import selectors from './common/selectors.js'
import { updateRetry } from './common/support.js'
import checkoutUiCustomSelectors from './selectors.js'
import { layoutScenario } from './outputvalidation.js'

export function orderProduct(prefix) {
  it(`In ${prefix} - Place the order`, updateRetry(2), () => {
    cy.get('body').then($body => {
      if ($body.find(selectors.ReceiverName).length) {
        cy.get(selectors.ReceiverName, { timeout: 5000 }).type('Syed')
        cy.get(selectors.GotoPaymentBtn).click()
      }
    })

    cy.get(selectors.PromissoryPayment, { timeout: 5000 })
      .should('be.visible')
      .click()
    cy.get(selectors.BuyNowBtn, { timeout: 10000 })
      .should('be.visible')
      .last()
      .click()
    cy.get(selectors.Search, { timeout: 30000 })
  })
}

export function verifySettings(type) {
  const enable = /Enable/.test(type)

  const { productName } = layoutScenario
  const prefix = `${type} Layout Setting`

  it(`${prefix} - Adding Product to Cart`, updateRetry(3), () => {
    // Search the product
    cy.searchProduct(productName)
    // Add product to cart
    cy.addProduct(productName, {
      proceedtoCheckout: true,
    })
  })

  it(`${prefix} - Updating product quantity to 2`, updateRetry(3), () => {
    // Update Product quantity to 2
    cy.updateProductQuantity(layoutScenario, {
      quantity: '2',
    })
  })

  it(`${prefix} - Updating Shipping Information`, updateRetry(3), () => {
    // Update Shipping Section
    cy.updateShippingInformation(layoutScenario)
  })

  it(`${prefix} - Display items unit price option`, updateRetry(2), () => {
    cy.get(checkoutUiCustomSelectors.CartLink).click()
    if (enable) {
      cy.get(checkoutUiCustomSelectors.quantityUnityPrice).should('exist')
    } else {
      cy.get(checkoutUiCustomSelectors.quantityUnityPrice).should('not.exist')
    }

    cy.get(selectors.ProceedtoPaymentBtn).click()
  })

  it(
    `${prefix} - Display google address form format option`,
    updateRetry(2),
    () => {
      cy.get('.checkout-steps_item_cart').click()
      if (enable) {
        cy.get('.v-custom-quantity-price__list--selling').should('exist')
      } else {
        cy.get('.v-custom-quantity-price__list--selling').should('not.exist')
      }

      cy.get(selectors.ProceedtoPaymentBtn).click()
    }
  )

  it(`${prefix} - Hide email step`, updateRetry(2), () => {
    if (enable) {
      cy.get(checkoutUiCustomSelectors.hideEmailHeader).should('not.be.visible')
    } else {
      cy.get(checkoutUiCustomSelectors.hideEmailHeader).should('be.visible')
    }
  })

  it(`${prefix} - Display simplified shipping date`, updateRetry(2), () => {
    if (enable) {
      cy.get(checkoutUiCustomSelectors.shippingTimeInfo).should('exist')
    } else {
      cy.get(checkoutUiCustomSelectors.shippingTimeInfo).should('not.exist')
    }
  })

  it(`${prefix} - Display payment options as accordion`, updateRetry(2), () => {
    if (enable) {
      cy.get(checkoutUiCustomSelectors.paymentAccordion).should('exist')
    } else {
      cy.get(checkoutUiCustomSelectors.paymentAccordion).should('not.exist')
    }
  })

  it(`${prefix} - Display notes field`, updateRetry(2), () => {
    if (enable) {
      cy.get(checkoutUiCustomSelectors.summaryNote).should('be.visible')
    } else {
      cy.get(checkoutUiCustomSelectors.summaryNote).should('not.be.visible')
    }
  })
}

export function fillLineItems(items, maxChar) {
  cy.get(checkoutUiCustomSelectors.productLineItem)
    .first()
    .type(items.lineItem1)
    .should('have.attr', 'maxlength')
    .then(maxlength => {
      cy.log(maxlength)
      expect(maxlength).to.equal(maxChar)
    })
  cy.get(checkoutUiCustomSelectors.productLineItem)
    .eq(1)
    .type(items.lineItem2)
  cy.get(checkoutUiCustomSelectors.productLineItem)
    .eq(2)
    .type(items.lineItem3)
}
