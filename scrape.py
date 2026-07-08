import requests
from bs4 import BeautifulSoup

session = requests.Session()

# Get the login page to get the anti-forgery token
login_url = "https://goimon.shop/AccountManage/Login"
response = session.get(login_url)

soup = BeautifulSoup(response.text, 'html.parser')
token_input = soup.find('input', {'name': '__RequestVerificationToken'})
token = token_input['value'] if token_input else ''

# Perform login
login_data = {
    '__RequestVerificationToken': token,
    'PhoneNumber': '0853272393',
    'Password': '12345678'
}

response = session.post(login_url, data=login_data)

# Fetch the dashboard or main page after login
# Usually it redirects to / or /Admin or /Dashboard
dashboard_url = "https://goimon.shop/Manager/Company" # Guessing based on common ASP.NET paths
response = session.get(dashboard_url)

if response.status_code == 200:
    with open('dashboard.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    print("Success. Saved to dashboard.html")
else:
    print("Failed to get dashboard. Status code:", response.status_code)
