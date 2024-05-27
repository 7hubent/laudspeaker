import credentials from "../fixtures/credentials";
import createTestCustomer from "../test-helpers/createTestCustomer";
import drag from "../test-helpers/drag";
import { loginFunc } from "../test-helpers/loginFunc";
import setMailgun from "../test-helpers/setMailgun";
import { setupOrganization } from "../test-helpers/setupOrganization";
import signup from "../test-helpers/signup";
import uuid from "../test-helpers/uuid";
import { uuid } from 'uuidv4';
import { createPrimaryKey } from "../test-helpers/createPrimaryKey";

const { email, password, firstName, lastName, organizationName, timeZone } =
  credentials;

describe("Customer upsert 3", { retries: 2 }, () => {
  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visit("/");
    cy.wait(1000);
    cy.request(`${Cypress.env("TESTS_API_BASE_URL")}/tests/reset-tests`);
    cy.wait(1000);
    signup(email, password, firstName, lastName);
    cy.wait(1000);
  });

  it("doesn't create duplicates using phone_number", () => {
    cy.viewport(1920, 1080);
    setupOrganization(organizationName, timeZone);
    cy.get("#settings").click();
    cy.contains("API").click();
    cy.wait(1000);

    const uuid1 = uuid();

    cy.get("#privateAPIKey")
      .invoke("val")
      .then((val) => {
        const apikey = val?.toString() || "no";
        createTestCustomer(email, ["phone_number"]);
        cy.wait(1000);

        cy.request({
          method: "POST",
          url: `${Cypress.env("TESTS_API_BASE_URL")}/events/batch`,
          headers: { Authorization: `Api-Key ${apikey}` },
          body: {
            batch: [
              {
                timestamp: "2024-03-15T02:31:05.295Z",
                uuid: "F451DF0A-D713-4076-AE20-41AB1641BC98",
                event: "$identify",
                source: "mobile",
                correlationKey: "_id",
                payload: {
                  $anon_distinct_id: uuid1,
                  distinct_id: email,
                  phone_number: "123-456-7890",
                },
                correlationValue: uuid1,
              }
            ],
          },
        }).then(() => {
          cy.wait(1000);

          cy.request({
            method: "POST",
            url: `${Cypress.env("TESTS_API_BASE_URL")}/customers/upsert`,
            headers: { Authorization: `Api-Key ${apikey}` },
            body: {
              primary_key: "john@smith.com",
              properties: {
                phone_number: "123-456-7890",
              }
            },
          }).then(() => {
            cy.wait(1000);

            cy.visit("/people");

            cy.get('.id-cell').should('have.length', 1);

            cy.get(".id-cell:first").click();
            cy.contains(uuid1).should("exist");
            cy.contains("phone_number").should("exist");
            cy.contains("123-456-7890").should("exist");
          });
        });
      });
  });

  it("doesn't create duplicates using phone_number_with_ext", () => {
    cy.viewport(1920, 1080);
    setupOrganization(organizationName, timeZone);
    cy.get("#settings").click();
    cy.contains("API").click();
    cy.wait(1000);

    const uuid1 = uuid();

    cy.get("#privateAPIKey")
      .invoke("val")
      .then((val) => {
        const apikey = val?.toString() || "no";
        createTestCustomer(email, ["phone_number_with_ext"]);
        cy.wait(1000);

        cy.request({
          method: "POST",
          url: `${Cypress.env("TESTS_API_BASE_URL")}/events/batch`,
          headers: { Authorization: `Api-Key ${apikey}` },
          body: {
            batch: [
              {
                timestamp: "2024-03-15T02:31:05.295Z",
                uuid: "F451DF0A-D713-4076-AE20-41AB1641BC98",
                event: "$identify",
                source: "mobile",
                correlationKey: "_id",
                payload: {
                  $anon_distinct_id: uuid1,
                  distinct_id: email,
                  phone_number_with_ext: "+1 000-111-2222",
                },
                correlationValue: uuid1,
              }
            ],
          },
        }).then(() => {
          cy.wait(1000);

          cy.request({
            method: "POST",
            url: `${Cypress.env("TESTS_API_BASE_URL")}/customers/upsert`,
            headers: { Authorization: `Api-Key ${apikey}` },
            body: {
              primary_key: "john@smith.com",
              properties: {
                phone_number_with_ext: "+1 000-111-2222",
              }
            },
          }).then(() => {
            cy.wait(1000);

            cy.visit("/people");

            cy.get('.id-cell').should('have.length', 1);

            cy.get(".id-cell:first").click();
            cy.contains(uuid1).should("exist");
            cy.contains("phone_number_with_ext").should("exist");
            cy.contains("+1 000-111-2222").should("exist");
          });
        });
      });
  });

});



