import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const TITLE_TEXT = `
 ██████╗ █████╗ ████████╗ █████╗ ███████╗████████╗██████╗  ██████╗ ███████╗██╗   ██╗
██╔════╝██╔══██╗╚══██╔══╝██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗██╔════╝╚██╗ ██╔╝
██║     ███████║   ██║   ███████║███████╗   ██║   ██████╔╝██║   ██║█████╗   ╚████╔╝ 
██║     ██╔══██║   ██║   ██╔══██║╚════██║   ██║   ██╔══██╗██║   ██║██╔══╝    ╚██╔╝  
╚██████╗██║  ██║   ██║   ██║  ██║███████║   ██║   ██║  ██║╚██████╔╝██║        ██║   
 ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝        ╚═╝   
`;

import { Link } from "@tanstack/react-router";

function HomeComponent() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<pre className="overflow-x-auto font-mono text-xs sm:text-sm whitespace-pre-wrap break-all">{TITLE_TEXT}</pre>
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">Bienvenido a Catastrofy 2</h2>
					<p className="text-muted-foreground mb-4">
						Suite de calculadoras financieras para decisiones informadas sobre tarjetas de crédito e hipotecas.
					</p>
					<div className="flex gap-4">
						<Link
							to="/calculator"
							className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
						>
							Ir a la Calculadora
						</Link>
						<Link
							to="/simulators/mortgage"
							className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
						>
							Ir al Simulador de Hipoteca
						</Link>
					</div>
				</section>
			</div>
		</div>
	);
}
