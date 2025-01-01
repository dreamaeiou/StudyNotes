import dash
import dash_bootstrap_components as dbc
import numpy as np
import pandas as pd
from dash import html

fake_df = pd.DataFrame(np.random.rand(1000).reshape(200, 5))
fake_df.rename(lambda s: f'字段{s}', axis=1, inplace=True) # 批量格式化列名
print(fake_df.head(10))
app = dash.Dash(__name__)

app.layout = html.Div(
    dbc.Container(
        # 一行代码渲染静态表格
        dbc.Table.from_dataframe(fake_df, striped=True),
        style={
            'margin-top': '50px'  # 设置顶部留白区域高度
        }
    )
)

if __name__ == '__main__':
    app.run_server(debug=True)