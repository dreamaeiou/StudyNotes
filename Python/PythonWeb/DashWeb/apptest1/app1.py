import dash
from dash import html
# import dash_html_components as html

app = dash.Dash(__name__)

app.layout = html.H1('第一个Dash应用！')

# Dash is running on http://127.0.0.1:8050/
if __name__ == '__main__':
    app.run_server()