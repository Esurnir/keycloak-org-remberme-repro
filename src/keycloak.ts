import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: "http://localhost:8080",
    realm: "realm-with-orgs",
    clientId: "public-client"
});

async function initializeKeycloak() {
    try {
        let organizationScopeParam = 'organization';
        let organizationName = localStorage.getItem('organization_name');
        if (organizationName) {
           organizationScopeParam = `organization:${organizationName}`;
        }

        const authenticated = await keycloak.init({
                scope: organizationScopeParam,
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`
            });

        if (authenticated) {
            const organizationScope = keycloak.idTokenParsed?.organization;
            if (organizationScope) {
                organizationName = Object.keys(organizationScope)[0];
                localStorage.setItem('organization_name', organizationName);
            }
            else {
                console.warn('Organization scope not found in token. Clearing stored organization name and clear the login state');
                localStorage.removeItem('organization_name');
                keycloak.clearToken();
            }
        }
        displayUserStatus();
    } catch (error) {
        console.error('Failed to initialize adapter:', error);
    }
}

function displayUserStatus() {
        const readTheDoc = document.querySelector<HTMLParagraphElement>('.read-the-docs');
        if (keycloak.authenticated) {
            const name = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Unknown User';
            const organizationScope = keycloak.idTokenParsed?.organization;
            const organizationName = organizationScope ? Object.keys(organizationScope)[0] : 'Unknown Organization';
            const message = `Hello, ${name}! You are authenticated. Your organization is ${organizationName}.`;
            if (readTheDoc) {
                readTheDoc.textContent = message;
            }
            console.log('User is authenticated');
            console.log(message);
        } else {
            if (readTheDoc) {
                readTheDoc.textContent = 'You are not authenticated. Please log in.';
            }
            console.log('User is not authenticated');
        }
}
function getOrganizationScopeName() {
    let organizationScopeParam = 'organization';
        let organizationName = localStorage.getItem('organization_name');
        if (organizationName) {
            organizationScopeParam = `organization:${organizationName}`;
        }
        return organizationScopeParam;
}
export function loginWithSavedOrg() {
    return keycloak.login(
    {
      scope: getOrganizationScopeName()
    }
  )
}
export function loginWithoutSavedOrg() {
    return keycloak.login(
        {
            scope: 'organization'
        }
    )
}
initializeKeycloak();
export default keycloak;