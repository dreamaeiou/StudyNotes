import dash
import dash_bootstrap_components as dbc
import mysql.connector
import pandas as pd
from dash import dcc
from dash import html
from dash.dependencies import Input, Output, State
from sqlalchemy import create_engine

# 连接MySQL数据库
# postgres_url = pymysql.connect(
#     host='localhost',
#     user='root',
#     password='666666',
#     database='onlinetradingsystem',
#     cursorclass=pymysql.cursors.DictCursor
# )

# 确保数据库URL、用户名和密码是正确的
# my_url = 'mysql+pymysql://root:666666@localhost:3306/onlinetradingsystem'
host_name = "localhost"
user_name = "root"
user_password = "666666"
db_name = "onlinetradingsystem"
my_url = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password,
            database=db_name
        )
# print(my_url)
engine = create_engine(my_url)

app = dash.Dash(__name__)
# 设计样式框
app.layout = html.Div(
    dbc.Container(
        [
            dbc.Row(
                [
                    dbc.Col(dbc.Button('更新数据库信息', id='refresh-db', style={'width': '100%'}), width=2),
                    dbc.Col(dcc.Dropdown(id='db-table-names', placeholder='选择库中数据表', style={'width': '100%'}), width=4),
                    dbc.Col(dbc.Button('查询', id='query', style={'width': '100%'}), width=1)
                ]
            ),
            html.Hr(),
            dbc.Row(
                [
                    dbc.Col(
                        id='query-result'
                    )
                ]
            )
        ],
        style={
            'margin-top': '50px'
        }
    )
)

@app.callback(
    Output('db-table-names', 'options'),
    Input('refresh-db', 'n_clicks'),
    prevent_initial_call=True
)


def refresh_table_names(n_clicks):
    # try:
    table_names_query = """
        SELECT *
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA='public';
    """
    table_names = pd.read_sql_query(table_names_query, con=engine)
    if not table_names.empty:
        return [{'label': name, 'value': name} for name in table_names['table_name']]
    else:
        return [{'label': 'No tables found', 'value': ''}]

@app.callback(
    Output('query-result', 'children'),
    Input('query', 'n_clicks'),
    State('db-table-names', 'value'),
    prevent_initial_call=True
)
def query_data_records(n_clicks, value):
    if value:
        query_result = pd.read_sql_query(f'SELECT * FROM `{value}` LIMIT 500', con=engine)
        return html.Div(dbc.Table.from_dataframe(query_result, striped=True), style={'height': '600px', 'overflow': 'auto'})
    else:
        return dash.no_update

if __name__ == '__main__':
    app.run_server(debug=True)
