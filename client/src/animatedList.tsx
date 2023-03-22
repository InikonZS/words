import React, { useEffect, useState } from "react";
import './animatedList.css';

interface IAnimatedItemProps{
    data: Array<any>;
    status: string;
    onShow: ()=>void;
    onHide: ()=>void;
}

function AnimatedItem({data, status, onShow, onHide}:IAnimatedItemProps){
    //const [status, setStatus] = useState('initial');
    /*useEffect(()=>{
        let tm: number = null;
        if (status == 'added'){
           tm = requestAnimationFrame(()=>{ tm = requestAnimationFrame(()=>{
                onShow();
           })});
        }  
        return ()=>{ 
            cancelAnimationFrame(tm); 
        }  
    }, [status])*/
    return <div className={`list_item list_item_${status}`} onAnimationEnd={()=>{
                if (status == 'removed'){
                    onHide()
                }
                if (status == 'added'){
                    onShow();
                }
            }
            
        }>
        {data.toString()}
    </div>
}

interface IAnimatedListProps{
    
}

export function AnimatedList({}: IAnimatedListProps){
    const [items, setItems] = useState<Array<any>>([1,2,3,4,5,6]);
    const [shownItems, setShownItems] = useState<Array<{data: any, status: string}>>([]);
    useEffect(()=>{
        setShownItems(last=>{
            const added = items.filter(it=> !last.find(jt=> jt.data == it));
            //const removed = last.filter(it=> !items.find(jt=> jt == it.data)).map(it=> it.data);
            return [
                ...last,
                ...added.map(it=>{
                    return {data: it, status: 'added'} 
                })
            ].map(it=>{
                if (!items.find(jt=> jt == it.data)){
                    return {...it, status: 'removed'}
                }
                return it;
            });;
        });
    }, [items]);

    return (
        <div>
            <div>
                <button onClick={()=>{
                    setItems(last=>{
                        (Math.random()<0.7) && last.push(Math.random());
                        return last.filter(it=> Math.random()>0.1);
                    })
                }}>change</button>
            </div>
            <div className="list_wrapper">
                {shownItems.map(it => {
                    return <AnimatedItem key={it.data} data={it.data} status={it.status} 
                    onShow ={()=>{
                        setShownItems(last => {
                            it.status = 'default';
                            return [...last]
                        })
                    }}
                    onHide={()=>{
                        setShownItems(last => last.filter(jt=> jt.data != it.data))
                    }}/>
                })}
            </div>
            <div>
                {items.map(it => {return <div>{it}</div>})}
            </div>
        </div>
    )
}