import dash
import plotly.express as px
from dash import dcc
from dash import html

app = dash.Dash(__name__)

fig = px.scatter(x=range(10), y=range(10))

app.layout = html.Div(
    [
        html.H1('嵌入plotly图表'),
        dcc.Graph(figure=fig)
    ]
)

if __name__ == '__main__':
    app.run_server()