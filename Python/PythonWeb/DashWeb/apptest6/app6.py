import dash
import dash_bootstrap_components as dbc
from dash import html

app = dash.Dash(__name__)

app.layout = html.Div(
    dbc.Container(
        [
            html.H5('（在模仿中精进数据可视化05）疫情期间市值增长top25公司'),
            html.Img(alt='top25', src="assets/img/top25.png", style={'width': '100%'})
            # 这里的路径需要额外加上 assets/ , 并且图片不能使用链接的形式
            # html.Img (src='https://img2020.cnblogs.com/blog/1344061/202011/1344061-20201129183046286-1089258422.png',style={'width': '100%'})
        ]
    )
)

if __name__ == "__main__":
    app.run_server(debug=True)