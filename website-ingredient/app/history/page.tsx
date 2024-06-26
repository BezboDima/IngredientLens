"use client"
import { title } from "@/components/primitives";
import React from "react";
import { callPostGatewayApi } from '../../src/request';
import {base64toFile, formatDate} from '../../src/generators';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {checkToken} from "../../src/cookies";
import {Accordion, AccordionItem, Card, CardHeader, CardBody, Image} from "@nextui-org/react";
import { Table, TableBody, TableHeader, TableColumn, TableRow, TableCell } from '@nextui-org/table'


interface History {
    date: string;
    imageHash: string;
    labels: string[];
    recepie: {
      ingredients: string[];
      steps: string[];
    };
  }

export default function history() {

    const [historyImages, setHistoryImages] = useState<string[]>([]);
    const [history, setHistory] = useState<History[]>([]);
    const [user, setUser] = useState("");
    const router = useRouter();

	useEffect(() => {
		const token = Cookies.get("token");
		const checked = checkToken(token);

		if (checked && typeof checked.login === 'string') {
			console.log('Login:', checked.login);
			setUser(checked.login);

            const data = {
                login: checked.login,
                item: 'history'
            }
            callPostGatewayApi('get-history', data)
            .then(async result => {
                setHistory(result.item);
                const images_paths = result.item.map((item: History, index: number) => {
                    return `user-image/${checked.login}/${item.imageHash}.png`;
                });

                const image_call = {
                    bucket: 'gereral-bucket',
                    images: images_paths
                };

                console.log(image_call);
                callPostGatewayApi('s3-download', image_call)
                .then(result => {
                    setHistoryImages(result.images);
                })
                .catch(error => {
                    console.log(error);
                })
            })
            .catch(error => {
                console.log(error)
            })
		} 
	}, [router]);

    return (
        <div className="w-4/5">
            <h3 className={title()}>History</h3>
            {!user && (
                <h1 className={title()}>
					You cannot have history if not logged in
				</h1>
            )}
            {history && history.map((item, index) => (
                <Card className="py-4 w-full">
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex justify-start w-full">
                    <h4 className="font-bold w-1/2 text-large">{formatDate(item.date)}</h4>
                    <h4 className="font-bold text-large"> Labels: {item.labels.toString()}</h4>
                </div>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
                    <div className="relative col-span-6 md:col-span-6">
                        {historyImages[index] ? (
                            <Image
                            alt="Not accessible"
                            className="object-cover rounded-xl"
                            src={historyImages[index]}
                            width={400}
                        />
                        ) : (
                            <p>Image not accessible</p>
                        )}
                    </div>
                    <div className="relative col-span-6 md:col-span-6">
                        <Table aria-label="Example table with dynamic content">
							<TableHeader>
								<TableColumn key="ingredients">Ingredients</TableColumn>
							</TableHeader>
							<TableBody>
								{item.recepie.ingredients.map((ingredient) =>
								<TableRow key={ingredient}>
									<TableCell>{ingredient}</TableCell>
								</TableRow>
								)}
							</TableBody>
						</Table>
                    </div>
                </div>
                <Accordion>
                    {item.recepie.steps.map((step, index) => (
                        <AccordionItem key={index + 1} aria-label={`Step ${index + 1}`} title={`Step ${index + 1}`}>
                            {step}
                        </AccordionItem>
                    ))}
				</Accordion>
                </CardBody>
              </Card>
            ))}
        </div>
      );
}