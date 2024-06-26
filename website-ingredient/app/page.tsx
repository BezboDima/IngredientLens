'use client'
import {checkToken} from "../src/cookies";
import NextLink from "next/link";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Link } from "@nextui-org/link";
import { useState } from "react";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code"
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";

export default function Home() {
	
	const router = useRouter();
	useEffect(() => {
		const token = Cookies.get("token");
		const checked = checkToken(token);

		if (checked && typeof checked.login === 'string') {
			console.log('Login:', checked.login);
		}
	}, [router]);

	return (
		<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
			<div className="inline-block w-1/2 text-center justify-center">
				<br/>
				<h1 className={title()}>Welcome to </h1>
				<p className={title({ color: "green", animate: "gradient" })}>Ingredient Lens</p>
				<br/>
				<h1 className={title()}>
					Use the power of AI to find recipes for dishes you&apos;ve seen.
				</h1>
				<h2 className={subtitle({ class: "mt-4" })}>
					Cook Like a Machine
				</h2>
			</div>

			<div className="flex gap-3">
				<Link
					isExternal
					as={NextLink}
					href={"/image_upload"}
					className={buttonStyles({ color: "primary", radius: "full", variant: "shadow" })}
				>
					Use the Power of Lens 
				</Link>
				{/* <Link
					isExternal
					as={NextLink}
					className={buttonStyles({ variant: "bordered", radius: "full" })}
					href={siteConfig.links.github}
				>
					<GithubIcon size={20} />
					GitHub
				</Link> */}
			</div>
			
		</section>
		
	);
}
