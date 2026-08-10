import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { adminAPI, type AdminCredentials } from '../api/client';
import travelMithraLogoAsset from '../assets/travel-mithra-logo.png';
import thankYouLogoAsset from '../assets/thank-you-logo.png';
import travelmithrathankyouAsset from '../assets/travel-mithra-thankyou.png';

type Booking = { id: string; customer: string; route: string; date: string; amount: number; received: number; previous: number; adults: number; kids: number; executive: string; active: boolean; paymentMode: string; remarks: string };
type Customer = { name: string; email: string; phone: string; password?: string; trips: number; joined: string; active: boolean };
type Reward = { id: number; agent: string; traveler: string; bookingId?: string; amount: number; note: string; status: string; createdAt: string };
const AGENTS_STORAGE_KEY = 'travelmithra-agents';

const executives = ['All sales executives', 'Aliya', 'Keerthi', 'Sharanya'];
const seedBookings: Booking[] = [
];
const seedCustomers: Customer[] = [
  ];

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function AdminManagement({ credentials }: { credentials: AdminCredentials }) {
  const location = useLocation();
  const view = location.pathname === '/customers' ? 'customers' : location.pathname === '/reports' ? 'reports' : location.pathname === '/rewards' ? 'rewards' : location.pathname === '/agents' ? 'agents' : 'bookings';
  const [bookings, setBookings] = useState(seedBookings);
  const [customers, setCustomers] = useState(seedCustomers);
  const [rewards, setRewards] = useState<Reward[]>([]);
  useEffect(() => { adminAPI.getCustomers(credentials).then(setCustomers).catch((error) => console.error(error)); }, [credentials]);
  useEffect(() => { adminAPI.getBookings(credentials).then(setBookings).catch((error) => console.error(error)); }, [credentials]);
  useEffect(() => { adminAPI.getRewards(credentials).then(setRewards).catch((error) => console.error(error)); }, [credentials]);
  const [executive, setExecutive] = useState('All sales executives');
  const [from, setFrom] = useState('2020-01-01');
  const [to, setTo] = useState('2099-12-31');
  const [showCustomer, setShowCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [query, setQuery] = useState('');
  const [formAmount, setFormAmount] = useState(0);
  const [formReceived, setFormReceived] = useState(0);
  const [formPrevious, setFormPrevious] = useState(0);
  useEffect(() => { if (!editingBooking || !showBooking) return; requestAnimationFrame(() => { const heading = document.querySelector('.booking-modal h3'); if (heading) heading.textContent = 'Update Booking'; const set = (name: string, value: string) => { const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement | null; if (input) input.value = value; }; set('customer', editingBooking.customer); set('destination', editingBooking.route); set('date', editingBooking.date); set('adults', String(editingBooking.adults)); set('kids', String(editingBooking.kids)); set('amount', String(editingBooking.amount)); set('received', String(editingBooking.received)); set('previous', String(editingBooking.previous)); set('paymentMode', editingBooking.paymentMode); set('executive', editingBooking.executive); set('remarks', editingBooking.remarks); }); }, [editingBooking, showBooking]);

  const filteredBookings = useMemo(() => bookings.filter((b) => (executive === 'All sales executives' || b.executive === executive) && (!query || `${b.customer} ${b.id} ${b.route}`.toLowerCase().includes(query.toLowerCase()))), [bookings, executive, query]);
  const reportBookings = bookings.filter((b) => { const bookingDate = String(b.date).slice(0, 10); return (executive === 'All sales executives' || b.executive === executive) && bookingDate >= from && bookingDate <= to; });
  const total = reportBookings.reduce((sum, b) => sum + b.amount, 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const downloadReceipt = (booking: Booking) => {
    const balance = booking.previous + booking.received - booking.amount;
    const receiptNo = `TMH/21/${formatDate(booking.date).replace(/\//g, '')}`;
    const amountToPay = Math.abs(Math.min(balance, 0));

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Receipt - ${booking.customer}</title>
<style>
@page{size:11.5in 5.5in;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;font-size:14px;color:#111;padding:24px;line-height:1.2;margin:0;min-height:100vh;overflow:hidden;position:relative}
body:before{content:'';position:fixed;top:18px;left:18px;width:calc(100vw - 36px);height:calc(100vh - 36px);border:3px solid #111;box-sizing:border-box;pointer-events:none;z-index:50}
body:after{display:none}
.logo{position:absolute;left:10%;top:14%;width:29%;text-align:center;z-index:3}.logo img{width:250px;max-width:100%;height:auto;display:block;margin:0 auto}
.company{position:absolute;right:4%;top:7%;width:49%;border:2px dotted #333;padding:11px 14px;font-family:Georgia,serif}.company h1{font-size:18px;font-weight:500;margin-bottom:5px}.company p{font-size:16px;font-weight:400;margin-bottom:3px}
.receipt-title{position:absolute;right:24%;top:26%;font-size:24px;font-weight:500;text-decoration:underline}
.info-line{position:absolute;right:4%;top:34%;width:49%;border:2px dotted #333;padding:12px;display:flex;justify-content:space-between;font-family:Georgia,serif;font-size:14px}.info-line strong{font-style:italic;font-weight:400}
.received-wrap,.details-left,.details-right{position:absolute}.received-wrap{left:3.5%;top:52%;width:37%}.received-wrap .label,.received-wrap .amount{display:none}
.details-left{left:3.5%;top:52%;width:37%}.details-right{right:4%;top:53%;width:37%}
.detail-item{display:grid;grid-template-columns:46% 54%;min-height:31px;border:2px dotted #444;border-bottom:0}.detail-item:last-child{border-bottom:2px solid #111}.detail-item .label{padding:6px 9px;font-family:Georgia,serif;font-weight:400;font-style:italic}.detail-item .value{padding:6px 9px;border-left:2px solid #111}.details-left .detail-item:first-child,.details-left .detail-item:nth-child(4),.details-left .detail-item:nth-child(5),.details-right .detail-item:nth-child(4){border-color:#111}.details-left .detail-item:first-child .label,.details-left .detail-item:nth-child(4) .label,.details-left .detail-item:nth-child(5) .label,.details-right .detail-item:nth-child(4) .label{font-style:italic}
.thankyou{position:fixed;left:50%;top:57%;width:120px;height:auto;transform:translateX(-50%);z-index:20;object-fit:contain;print-color-adjust:exact;-webkit-print-color-adjust:exact}
.thankyou svg{display:block;width:100%;height:100%}.thankyou .stamp-bg{fill:#a9ddf2;stroke:#4b4b4b;stroke-width:2}.thankyou .stamp-ring{fill:none;stroke:#4b4b4b;stroke-width:1.5}.thankyou .stamp-dash{fill:none;stroke:#4b6cc4;stroke-width:1.2;stroke-dasharray:3 3}.thankyou text{font-family:Arial,sans-serif;font-weight:800;fill:#111;letter-spacing:3px}.thankyou .stamp-side{font-size:7px;font-weight:400;letter-spacing:2px}.thankyou .stamp-heart{fill:#f26b2e}.thankyou .stamp-map{fill:#e79b67;opacity:.9}.thankyou .stamp-hand{fill:#e5a475;stroke:#946744;stroke-width:.7}.thankyou .stamp-cuff{fill:#375d8d}
.footer{position:absolute;left:0;right:0;bottom:7%;text-align:center;font-size:13px}.footer p{margin-bottom:5px}
@media print{html,body{width:100%;height:100%;margin:0}body{padding:24px;min-height:100vh}}
</style></head>
<body>
<div class="logo">
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAABQCAMAAAD1aRpWAAAAxlBMVEX///8AAAAAAB4AADsAADoAADcAADUAADoAADsAADoAADsAADsAADoAADoAADsAADoAADoAADoAADoAADsAADoAADoAADo7Ozs7OzsAAAA/Pz9JSUlTU1NPT084ODg6Ojo6Ojo7Ozs6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo7Ozs6Ojo6Ojo6Ojo6Ojo7Ozs6Ojo6Ojr+O7AxAAAAMXRSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wDqEt9AAAIABJREFUeNqUvQmXq7qSIBhT5jxqzqMkm2Vbu+vu/v9f9wUQICG53X369V4r3U4pFIQCwp/vf//7X12zLMs8z/O0LE2zLPM8z0vsTdM0TqdpnKZpnKZp/jRN4zTN0xRfTtM4L+M4T+M4L+M0TeMXfmd9mYfxMAwPj4c4xX4H/RrmZZ7m+/v7ruu6ruu6YRiGYRgOwzAMh8MwDMMH/RkO/Q/+PhyG/qf/hkP/MBwGPXW/7kN8FH/XHh+H4Zdz+PXrV/eL7/9+eXl5/c/LT39+efnpy8vLy8vLn76+/PTl5eXLV7//8vLy5cvLy1++/v3Lly9f/v7ly5cvf/vy5cvX/+XLl69///Ll3+9b51B938dxnMa/3N/fN03TNE1jGIZhGIbDYTgcDkdx0A+G4TAcjvHhMBwOw0F7h+F4PAxH7/34a+h+facP4y/hcDj+ejj8+vXrV98ffv36t6+vX79+/fvXr19/+vrr16+v//L161+/fv3691+/fv369evXX7/++9evX7/+7cs/f/369b+//P3Xr1///ffff/369e+//vPiH79+/dvfnv769evXv/39p7///esff/369W9/+/r1r399/fr1P3//+vXrX//+9evXf7/4x69fv/79y9evf//69eu//v71a//169evf//61z+//sfXr1//99+//v2f//j69eu//vn1P7/++9evX/+Fv1+//t/Pc/zX169f//f3X79+/d///ud//uc/fvr69ev//uc//vPrv//5n//86eu/f/3f//znP3/66V//+c9//vTqX//5z3/+9Olf//nPf/706V//+c9//vT6X//5z3/+9Olf//nPf/706V//+c9//vT6X//5z//+6et//+c///+fvv7Xf/7znz99/e///Oc/f/r6f//5z3/+9Om//vOf//zp6//+8z//+dOn//7Pf/7zp0//+5///OdPn/7vn//8509f/vuf//znT5/++z//+c+fvvzfP//5z58+/fc///nPn7783z//+c+fvvz3P//5z5++/N9//vOfP33573/+858/ffnvf/7znz99+e9//vOfP33573/+858/ffn/+/Of//zpy3//5z//+dOX//7Pf/7zpy///Z///OdPX/77P//5z5++/Pc///nPn77893/+858/ffn/+vOf//zpy3//5z//+dOX//7Pf/7zpy///Z///OdPX/77P//5z5++/Pc///nPn77893/+858/ffn/+vOf//zpy3//5z//+dOX//7Pf/7zpy///Z///OdPX/77P//5z5++/Pc///nPn77893/+858/ffn/+vOf//zpy3//5z//+dOX//zPf/7037/+3//+9/9/+fLlr1++/PXvX7789cuXv/z961+//OXvX7/89cvf//rlr3/78pe/fvnrl7//9ctf//blL3/78tcvf/nbl79++cvfvvz1y1/+9uWvX/7yty9//fKXv33565e//O3LX7/85W9f/vrlL3/78pcvf/nbX/7y17/+/S9/+/J///rll7/9/S9/+ctf/v7ll79++ctf/vbll19++csvv/z1y19++eWXv/z1l19++eUvf/nrL7/88stf/vrLL7/88pe//vLLL7/85a+//PLLL3/56y+//PLLX/76yy+//PKXv/7yyy+//OWvv/zyyy9/+esvv/zyy1/++ssvv/zyl7/+8ssvv/zlr7/88svf/vbLL7/88pe//vLLL7/85a+//PLLL3/56y+//PKXv/7yyy+//OWvv/zyyy9/+esvv/zyy1/++ssvv/zyl7/+8ssvv/zlr7/88svf/vbLL7/88pe//vLLL7/85a+//PLLL3/56y+//PKXv/7yyy+//OWvv/zyyy9/+esvv/zyy1/++ssvv/zyl7/+8ssvv/zlr7/88svf/vbLL7/88pe//vLL3/76yy+//PKXv/7yyy+//OWvv/zyy1/++ssvv/zyl7/++8svv/zyl7/+8ssvv/zlr7/88stf/vrLL7/88pe//vLLL3/56y+//PKXv/7yyy+//OXVf/3yyy+//OXVf/3yyy+//PJ/Xv3yyy+//PLq1S+//PLLL6/+/eqXX3755dVfv/rll19+efXTq19++eWXV3/79Msvv/zy6qdXv/zyyy+v/v7pl19++eXVT69++eWXX179/dMvv/zyy6ufXv3yyy+/vPr7p19++eWXVz+9+uWXX3559fdPv/zyyy+vfnr1yy+//PLq759++eWXV1799Msff/zx6qdffvnjjz9e/fWXP/74449XP/3yxx9//PHqr7/88ccff7z66S9//PHHH6/++ssff/zxx6uf/vLHH3/88eqvv/zxxx9/vPrpL3/88ccfr/76yx9//PHHq5/++scff/zx6qe//vHHH3+8+usvf/zxxx+vfvrLH3/88cerf/3rjz/++OPVT3/5448//nj11z/++OOPP1799Jc//vjjj1d//eOPP//889VPf/nzn//856u//vnnP//5z1d//fOf//znP1/99c9//vOf/3z11z//+c9//vPVX//85z//+c9Xf/3zn//85z9f/fXPf/7zn/989dc///nPf/7z1V///Oc///nPV3/985///Oc/X/31z3/+85//fPXXP//5z3/+89Vf//znP//5z1d//fOf//znP1/99c9//vOf/3z11z//+c9//vPVX//85z//+c9Xf/3zn//85z9f/fXPf/7zn/989dc///nPf/7z1V///Oc///nPV3/985///Oc/X/31z3/+85//fPXXP//5z3/+89Vf//znP//5z1d//fOf//znP1/99c9//vOf/3z11z//+c9//vPVX//85z//+c9Xf/3zn//85z9f/fXPf/7zn/989dc///nPf/7z1V///Oc///nPV3/985///Oc/X/31z3/+85//fPXXP//5z3/+89Vf//znP//5z1f/evXPf/7zn6/+9eqf//znP//5179e/fOf//znP//616t//vOf//znf/3r1T//+c9//vO//vXqn//85z//+V//evXPf/7zn//8r3+9+uc///nPf/7Xv17985///Oc///WvV//85z//+c///a9X//znP//57//+16t//vOf//z3f//r1T//+c9//vu///WXV//85z//+e///teff/3zn//857//+19//vXPf/7zn//+73/9+dc///nPf/77v//151///Oc///nv//7Xn3/985///Oe///tff/71z3/+85///u9//fnXP//5z3/++7//9edf//znP//57//+159//fOf//znv//7X3/+9c9//vOf//7vf/351z//+c9//vu///XnX//85z//+e///teff/3zn//857//+19//vXPf/7zn//+73/9+dc///nPf/77v//151///Oc///nv//7Xn3/985///Oe///tff/71z3/+85///u9//fnXP//5z3/++7//9edf//znP//57//+159//fOf//znv//7X3/+9c9//vOf//7vf/351z//+c9//vu///XnX//85z//+e///teff/3zn//857//+19//vXPf/7zn//+73/9+dc///nPf/77v//151///Oc///nv//7Xn3/985///Oe///tff/71z3/+85///u9//fnXP//5z3/++7//9edf//znP//57//+17/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/7517/++ueff/75179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//6179+/fPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++vPPP//617/++svPP//8619//fnnn3/966+//vzzz7/+9ddff/7551//+uuvv/7888+//vXXX3/++edf//rrr7/+/PPPv/71119//vnnX//666+//vzzz7/+9ddff/7551/++uuvv/7888+//PXXX3/++edf/vrrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/3555///Ndff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888///XXX3/++eef//rrr7/+/PPPP//1119//fnnn3/566+//vzzzz//9ddff/35559//euvv/78888//frXX3/9+eef//3rr7/+/PPPP//1119//vnnn3/966+//vzzzz//9ddf//nnn3/+9a+//vzzzz///Ndff/35559//uuvv/76888///zXX3/9+eefP//1119//vnnz3/99deff/75819//fXnn3/+/Ndff/35558///XXX3/++efPf/31159//vnzX3/99eeff/78119//fnnnz//9ddff/755y9//fXXX3/++ecvf/31119//vnLX3/99ddff/7y119//fXXX7/89ddf//jHP7789ddf//jHP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//vGPP/74119//eMf//jjj3/99dc//c2P2o93c348Pj7m4X6Y+p/n+ziN9/ePj/f3D4/H+8PD4/3D4+Hx4eHh8fjwcHg8PjweHx+Ph+O9eP3w8Ph4fDgeH+Xz8Hh8PD4efz18fHjx+viI78bjr7+GHx/0h2P/6/F4/OnT41+/fv36+Pj4+Pj4+Pj4+Pj4+PiYX3/9+vWPHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx48ePHz9+/Pjx4eHxp0+Pf/z48ePHjx8/fvz48ePHjx8/fvz48eOPH3/8+PHHT3/88cenT3/88ek/P3369MdPnz59+vTp06c/fvr06dOnT5/+89OnT58+/cenT58+ffr0H79+/enTp0///vXrT58+ffqPX7/+9OnTp3//+vWnT58+/cfXrz99+vTp379+/enTp0//8fXrT58+ffr3r19/+vTp0398/frTp0+f/v3r158+ffr0H1+//vTp06d///r1p0+fPv3H168/ffr06d+5P3369OnTp0+fPn369OnTp0/+e/r06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+ffr06dOnT58+/f9s+r8A2uO1FQDQpTMAAAAASUVORK5CYII=" alt="Travel Mithra Holidays" />
</div>
<div class="company">
  <h1>Travel Mithra Holidays</h1>
  <p>KS3, Heavenly Plaza, Padamugal, Kakkanad, Cochin - 21</p>
  <p>PH: 8129430111</p>
</div>
<div class="receipt-title">RECEIPT</div>
<div class="info-line">
  <span><strong>Date</strong> :${formatDate(booking.date)}</span>
  <span><strong>Receipt No</strong> :${receiptNo}</span>
</div>
<div class="received-wrap"></div>
<img class="thankyou" src="__THANK_YOU_LOGO__" alt="Thank you" />
<!--
  <svg viewBox="0 0 100 100" role="img">
    <defs>
      <path id="stamp-top" d="M 15,48 A 35,35 0 0,1 85,48" />
      <path id="stamp-left" d="M 20,57 A 36,36 0 0,0 42,85" />
      <path id="stamp-bottom" d="M 39,85 A 36,36 0 0,0 61,85" />
      <path id="stamp-right" d="M 58,85 A 36,36 0 0,0 80,57" />
    </defs>
    <circle class="stamp-bg" cx="50" cy="50" r="47" />
    <circle class="stamp-ring" cx="50" cy="50" r="39" />
    <circle class="stamp-dash" cx="50" cy="50" r="25" />
    <text font-size="10"><textPath href="#stamp-top" startOffset="50%" text-anchor="middle">THANK YOU</textPath></text>
    <text class="stamp-side" font-size="5.5"><textPath href="#stamp-left" startOffset="50%" text-anchor="middle">WE GROW</textPath></text>
    <text class="stamp-side" font-size="5.5"><textPath href="#stamp-bottom" startOffset="50%" text-anchor="middle">STRONGER</textPath></text>
    <text class="stamp-side" font-size="5.5"><textPath href="#stamp-right" startOffset="50%" text-anchor="middle">EVERYDAY</textPath></text>
    <text class="stamp-heart" x="17" y="39" font-size="12" text-anchor="middle">♥</text>
    <text class="stamp-heart" x="83" y="39" font-size="12" text-anchor="middle">♥</text>
    <path class="stamp-map" d="M19 43c8-4 10-7 17-5 5 1 8-2 13 0 6 2 8-2 14-1 5 1 7 4 12 6-5 3-6 7-12 6-6-1-8 4-13 2-4-2-8 1-13-1-5-2-8-1-12-3z"/>
    <path class="stamp-cuff" d="M29 44l8 4-5 12-8-4zM63 38l8-4 7 13-8 4z"/>
    <path class="stamp-hand" d="M34 48c3-3 5-3 8-1l7 5 7-7c2-2 5 0 4 2l-6 8c-2 3-5 4-8 2l-8-5-4 2-4-3z"/>
    <path class="stamp-hand" d="M49 51l-5-6c-2-2 0-4 2-3l7 6 4-4c2-2 4 0 3 2l-5 6z"/>
    <path class="stamp-hand" d="M43 48l-5-4c-2-2 0-4 2-3l7 5z"/>
    <path fill="none" stroke="#4b6cc4" stroke-width="1.3" d="M40 57l5 3 5-2 5 2 5-4"/>
  </svg>
</div>-->
<div class="details-left">
<div class="detail-item">
  <div class="label">Received a sum of</div>
  <div class="value">${money(booking.received)}/-</div>
</div>
<div class="detail-item">
  <div class="label">On account of</div>
  <div class="value">${booking.route}</div>
</div>
<div class="detail-item">
  <div class="label">Payment Mode</div>
  <div class="value">${booking.paymentMode}</div>
</div>
<div class="detail-item">
  <div class="label">Total Closing Amount</div>
  <div class="value">${money(booking.amount)}/-</div>
</div>
<div class="detail-item">
  <div class="label">Balance to pay</div>
  <div class="value">${money(amountToPay)}/-</div>
</div>
</div>
<div class="details-right">
<div class="detail-item">
  <div class="label">Part payment from</div>
  <div class="value">${booking.customer}</div>
</div>
<div class="detail-item">
  <div class="label">Group of</div>
  <div class="value">${booking.adults} Adult + ${booking.kids} Kid ADULT</div>
</div>
<div class="detail-item">
  <div class="label">Payment Accepted by</div>
  <div class="value">SHARANYA RATHEESH</div>
</div>
<div class="detail-item">
  <div class="label">Previous Payments</div>
  <div class="value">${money(booking.previous)}/-</div>
</div>
<div class="detail-item"><div class="label"></div><div class="value">${booking.remarks || '—'}</div></div>
</div>
<div class="footer">
  <p>Note : This is a computer generated document hence doesn't require any signature/stamp.</p>
  <p>*Terms and Conditions Apply.</p>
</div>
</body></html>`;

    // The receipt is opened from a blob URL, so a relative Vite asset URL would
    // resolve against blob:... and disappear. Resolve it against the app URL.
    const receiptLogoUrl = new URL(travelMithraLogoAsset, window.location.href).href;
    const thankYouLogoUrl = new URL(thankYouLogoAsset, window.location.href).href;
    const brandedHtml = html
      .replace(/src="data:image\/png;base64,[^"]+"/, `src="${receiptLogoUrl}"`)
      .replace('__THANK_YOU_LOGO__', thankYouLogoUrl);
    const blob = new Blob([brandedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) { win.onload = () => { win.print(); }; } else { const link = document.createElement('a'); link.href = url; link.download = `${booking.customer.replace(/\s+/g, '-').toLowerCase()}-receipt.html`; link.click(); }
    URL.revokeObjectURL(url);
  };

  const addBooking = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const booking = { id: `TM-${24082 + bookings.length}`, customer: String(form.get('customer')), route: String(form.get('destination')), date: String(form.get('date')), amount: Number(form.get('amount') || 0), received: Number(form.get('received') || 0), previous: Number(form.get('previous') || 0), adults: Number(form.get('adults') || 0), kids: Number(form.get('kids') || 0), executive: String(form.get('executive')), active: true, paymentMode: String(form.get('paymentMode') || 'BANK TRANSFER'), remarks: String(form.get('remarks') || '') }; try { const saved = await adminAPI.saveBooking(credentials, booking); setBookings((items) => [saved, ...items]); setShowBooking(false); event.currentTarget.reset(); } catch (error) { console.error(error); } };

  const downloadReport = () => {
    const rows = [['Sales report', `${from} to ${to}`], ['Booking ID', 'Customer', 'Route', 'Executive', 'Date', 'Amount'], ...reportBookings.map((b) => [b.id, b.customer, b.route, b.executive, b.date, money(b.amount)])];
    const reportRows = reportBookings.map((b) => `<tr><td>${b.id}</td><td>${b.customer}</td><td>${b.route}</td><td>${b.executive}</td><td>${String(b.date).slice(0, 10)}</td><td>${money(b.amount)}</td></tr>`).join('');
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    reportWindow.document.write(`<!doctype html><html><head><title>Sales Report</title><style>@page{size:A4 landscape;margin:14mm}body{font-family:Arial,sans-serif;color:#13243a}h1{color:#1777b9}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #cbd6e2;padding:10px;text-align:left}th{background:#edf4f8;font-weight:600}.summary{display:flex;gap:35px;margin-top:18px}.summary strong{display:block;font-size:20px}</style></head><body><h1>Travelmithra Sales Report</h1><p>Period: ${from} to ${to} | Filter: ${executive}</p><div class="summary"><div>Total Sales<strong>${money(total)}</strong></div><div>Bookings<strong>${reportBookings.length}</strong></div></div><table><thead><tr><th>Booking ID</th><th>Customer</th><th>Route</th><th>Sales Executive</th><th>Date</th><th>Amount</th></tr></thead><tbody>${reportRows || '<tr><td colspan="6">No bookings found.</td></tr>'}</tbody></table></body></html>`);
    reportWindow.document.title = 'Travelmithra Holidays Sales Report'; reportWindow.document.close(); reportWindow.focus(); reportWindow.print();
  };

  const saveCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const customer = { name: String(form.get('name')), email: String(form.get('email')), phone: String(form.get('phone')), password: String(form.get('password') || editingCustomer?.password || ''), trips: editingCustomer?.trips ?? 0, joined: editingCustomer?.joined ?? 'Jul 29, 2026', active: editingCustomer?.active ?? true };
    if (!editingCustomer) {
      try { const saved = await adminAPI.createCustomer(credentials, customer); setCustomers((items) => [saved, ...items]); } catch (error) { console.error(error); return; }
    }
    if (editingCustomer) setCustomers(customers.map((item) => item.email === editingCustomer.email ? customer : item));
    setShowCustomer(false); setEditingCustomer(null); event.currentTarget.reset();
  };

return <section className="crm-page" onClick={(event) => { const target = event.target as HTMLElement; if (target.tagName === 'BUTTON' && target.textContent?.trim() === 'Edit') { const row = target.closest('tr'); const rowText = row?.textContent || ''; const selected = bookings.find((booking) => rowText.includes(booking.customer) && rowText.includes(booking.route)); if (selected) { setEditingBooking(selected); setShowBooking(true); } } }}>
    {view === 'rewards' && <AgentRewards bookings={bookings} rewards={rewards} credentials={credentials} onIssued={(reward) => setRewards((items) => [reward, ...items])} />}
    {view === 'agents' && <AgentManagement />}
    <div className="crm-topbar"><div><p className="section-kicker">Travelmithra operations</p><h2>{view === 'bookings' ? 'Bookings' : view === 'customers' ? 'Customers' : 'Sales reports'}</h2><p className="crm-subtitle">Manage your travel business with clarity.</p></div><div className="crm-user"><span className="crm-avatar">A</span><span><strong>Admin</strong><small>Operations</small></span><span>⌄</span></div></div>
    {view === 'bookings' && <><div className="crm-toolbar"><div><h2>Bookings Management</h2><p>Manage all bookings here</p></div><button className="crm-primary" onClick={() => setShowBooking(true)}>＋ Create Booking</button></div><div className="crm-filters booking-filters"><input placeholder="Search destination/customer" value={query} onChange={(e) => setQuery(e.target.value)} /><select><option>All Customers</option></select><select><option>All Payment Status</option></select><select><option>All Booking Status</option></select><input type="date" /><input type="date" /></div><BookingTable bookings={filteredBookings} onToggle={(id) => setBookings(bookings.map((b) => b.id === id ? { ...b, active: !b.active } : b))} onDownload={downloadReceipt} onDelete={async (id) => { if (!window.confirm('Delete this booking?')) return; await adminAPI.deleteBooking(credentials, id); setBookings((items) => items.filter((b) => b.id !== id)); }} /></>}
    {view === 'customers' && <><div className="crm-toolbar"><div><h2>Customers Management</h2><p>Manage all customer details here</p></div><button className="crm-primary" onClick={() => { setEditingCustomer(null); setShowCustomer(true); }}>＋ Create Customer</button></div><div className="crm-table-wrap customer-table-wrap"><table className="crm-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead><tbody>{customers.map((c) => <tr key={c.email}><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td><span className={`status-pill ${c.active ? 'active' : 'inactive'}`}>{c.active ? 'Active' : 'Inactive'}</span></td><td><button className="table-action" onClick={() => { setEditingCustomer(c); setShowCustomer(true); }}>Edit</button><button className="table-action" onClick={() => setCustomers(customers.map((item) => item.email === c.email ? { ...item, active: !item.active } : item))}>{c.active ? 'Inactive' : 'Active'}</button></td></tr>)}</tbody></table>{customers.length === 0 && <p className="empty-state">No customers yet.</p>}</div></>}
    {view === 'reports' && <><div className="report-hero"><div><p className="section-kicker">Performance overview</p><h3>Sales report</h3><p>Analyze bookings and revenue by sales executive and date range.</p></div><button className="crm-primary" onClick={downloadReport}>⇩ Download PDF</button></div><div className="report-filters"><label>Sales executive<select value={executive} onChange={(e) => setExecutive(e.target.value)}>{executives.map((e) => <option key={e}>{e}</option>)}</select></label><label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label></div><div className="report-stats"><div><span>Total sales</span><strong>{money(total)}</strong></div><div><span>Bookings</span><strong>{reportBookings.length}</strong></div><div><span>Average booking</span><strong>{money(reportBookings.length ? Math.round(total / reportBookings.length) : 0)}</strong></div><div className="report-card"><h3>Monthly sales report <small>{from} — {to}</small></h3><BookingTable bookings={reportBookings} onToggle={() => undefined} /></div></div></>}
    {showCustomer && <div className="modal-backdrop"><form className="crm-modal" onSubmit={saveCustomer}><button type="button" className="modal-close" onClick={() => { setShowCustomer(false); setEditingCustomer(null); }}>×</button><h3>{editingCustomer ? 'Edit Customer' : 'Create Customer'}</h3><input name="name" required defaultValue={editingCustomer?.name} placeholder="Enter customer name" /><input name="email" type="email" required defaultValue={editingCustomer?.email} placeholder="Enter email" /><input name="phone" required defaultValue={editingCustomer?.phone} placeholder="Enter phone number" /><input name="password" type="password" required={!editingCustomer} placeholder={editingCustomer ? 'Leave blank to keep password' : 'Enter password'} /><button className="crm-primary">{editingCustomer ? 'Save Changes' : 'Create Customer'}</button></form></div>}
    {showBooking && <div className="modal-backdrop booking-drawer"><form className="crm-modal booking-modal" onSubmit={addBooking}><button type="button" className="modal-close" onClick={() => setShowBooking(false)}>×</button><h3>Create Booking</h3><label>Customer<select name="customer" required><option value="">Select Customer</option>{customers.map((c) => <option key={c.email}>{c.name}</option>)}</select></label><label>Destination<input name="destination" required placeholder="Destination" /></label><label>Trip Date<input name="date" type="date" required /></label><div className="two-fields"><label>Adults<input name="adults" type="number" min="1" defaultValue="1" /></label><label>Kids<input name="kids" type="number" min="0" defaultValue="0" /></label></div><label>Total Closing Amount<input name="amount" type="number" min="0" required placeholder="Total closing amount" /></label><label>Sum of Amount<input name="received" type="number" min="0" defaultValue="0" placeholder="Sum of amount" /></label><label>Previous Amount<input name="previous" type="number" min="0" defaultValue="0" placeholder="Previous amount" /></label><label>Balance Amount<input disabled value="Calculated: previous + sum - closing" readOnly /></label><label>Payment Mode<select name="paymentMode" required><option value="BANK TRANSFER">BANK TRANSFER</option><option value="CASH">CASH</option><option value="CARD">CARD</option><option value="UPI">UPI</option><option value="CHEQUE">CHEQUE</option></select></label><label>Remarks<input name="remarks" placeholder="Remarks if any" /></label><label>Sales Executive<select name="executive">{executives.slice(1).map((e) => <option key={e}>{e}</option>)}</select></label><button className="crm-primary">Create Booking</button></form></div>}
  </section>;
}

function BookingTable({ bookings, onToggle, onDownload, onDelete }: { bookings: Booking[]; onToggle: (id: string) => void; onDownload?: (booking: Booking) => void; onDelete?: (id: string) => void }) { return <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Destination / Customer</th><th>Trip Date</th><th>Travellers</th><th>Amount</th><th>Payment</th><th>Booking</th><th></th></tr></thead><tbody>{bookings.map((b) => <tr key={b.id}><td><strong>{b.route}</strong><small className="table-sub">{b.customer}</small></td><td>{b.date}</td><td>{b.adults} Adult + {b.kids} Kid</td><td><strong>{money(b.amount)}</strong></td><td>Partial</td><td>{b.remarks || '—'}</td><td><span className={`status-pill ${b.active ? 'active' : 'inactive'}`}>{b.active ? 'Confirmed' : 'Inactive'}</span></td><td><button className="table-action">Edit</button><button className="table-action" onClick={() => onDownload?.(b)}>Download receipt</button><button className="table-action" onClick={() => onToggle(b.id)}>{b.active ? 'Inactive' : 'Active'}</button>{onDelete && <button className="table-action danger" onClick={() => onDelete(b.id)}>Delete</button>}</td></tr>)}</tbody></table>{bookings.length === 0 && <p className="empty-state">No bookings match this filter.</p>}</div>; }

function AgentRewards({ bookings, rewards, credentials, onIssued }: { bookings: Booking[]; rewards: Reward[]; credentials: AdminCredentials; onIssued: (reward: Reward) => void }) {
  const agentNames: string[] = [];
  const [rewardRate, setRewardRate] = useState(5);
  const [agents] = useState<{ name: string }[]>(() => JSON.parse(localStorage.getItem(AGENTS_STORAGE_KEY) || '[]'));
  const [showIssue, setShowIssue] = useState(false);
  const issue = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { const reward = await adminAPI.issueReward(credentials, { agent: form.get('agent'), traveler: form.get('traveler'), bookingId: form.get('bookingId'), amount: form.get('amount'), note: form.get('note') }); onIssued(reward); setShowIssue(false); event.currentTarget.reset(); } catch (error) { console.error(error); } };
  return <><div className="crm-toolbar"><div><h2>Agent Rewards</h2><p>Issue a reward after an agent converts a traveler into a trip.</p></div><button type="button" className="crm-primary" onClick={() => setShowIssue(true)}>＋ Issue Reward</button></div><div className="crm-table-wrap rewards-table-wrap"><table className="crm-table"><thead><tr><th>Agent</th><th>Traveler</th><th>Booking</th><th>Reward</th><th>Status</th></tr></thead><tbody>{rewards.map((reward) => <tr key={reward.id}><td><strong>{reward.agent}</strong></td><td>{reward.traveler}</td><td>{reward.bookingId || '—'}</td><td><strong>{money(Number(reward.amount))}</strong></td><td><span className="status-pill active">{reward.status}</span></td></tr>)}</tbody></table>{rewards.length === 0 && <p className="empty-state">No rewards issued yet.</p>}</div>{showIssue && <div className="modal-backdrop"><form className="crm-modal" onSubmit={issue}><button type="button" className="modal-close" onClick={() => setShowIssue(false)}>×</button><h3>Issue Reward</h3><p className="crm-subtitle">Reward the agent who converted a traveler into a trip.</p>{agents.length ? <label>Agent name<select name="agent" required defaultValue=""><option value="" disabled>Select agent</option>{agents.map((agent) => <option key={agent.name}>{agent.name}</option>)}</select></label> : <p className="empty-state">Create an agent first before issuing a reward.</p>}<label>Traveler name<input name="traveler" required placeholder="Enter traveler name" /></label><label>Booking ID<input name="bookingId" placeholder="Optional booking ID" /></label><label>Reward amount<input name="amount" required type="number" min="1" placeholder="Enter reward amount" /></label><label>Note<input name="note" placeholder="Optional note" /></label><button className="crm-primary" disabled={!agents.length}>Issue Reward</button></form></div>}</>;
}

function AgentManagement() {
  const [agents, setAgents] = useState<{ name: string; executive: string; phone: string; aadhaar: string }[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [executive, setExecutive] = useState('Aliya');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  useEffect(() => { const saved = JSON.parse(localStorage.getItem(AGENTS_STORAGE_KEY) || '[]'); setAgents(saved); }, []);
  const sendOtp = () => { if (!/^\d{12}$/.test(aadhaar) || !/^\d{10}$/.test(phone)) return; const code = String(Math.floor(100000 + Math.random() * 900000)); setSentOtp(code); setOtp(''); setOtpVerified(false); window.alert(`OTP sent to mobile number ending ${phone.slice(-4)}. Demo OTP: ${code}`); };
  const addAgent = (event: React.FormEvent) => { event.preventDefault(); if (!/^\d{12}$/.test(aadhaar) || !/^\d{10}$/.test(phone) || !sentOtp || otp !== sentOtp || !otpVerified) return; const updated = [...agents, { name, executive, phone, aadhaar }]; setAgents(updated); localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(updated)); setName(''); setPhone(''); setAadhaar(''); setOtp(''); setSentOtp(''); setOtpVerified(false); setShowCreate(false); };
  return <><div className="crm-toolbar"><div><h2>Agent Management</h2><p>Manage agents under each Sales Executive.</p></div><button type="button" className="crm-primary" onClick={() => setShowCreate(true)}>＋ Create Agent</button></div><div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Agent Name</th><th>Sales Executive</th><th>Mobile</th><th>Aadhaar</th><th>Reward Status</th><th>Actions</th></tr></thead><tbody>{agents.map((agent) => <tr key={`${agent.name}-${agent.phone}`}><td><strong>{agent.name}</strong></td><td>{agent.executive}</td><td>{agent.phone}</td><td>{agent.aadhaar}</td><td>Verified</td><td><button type="button" className="table-action danger" onClick={() => { if (window.confirm(`Delete agent ${agent.name}?`)) setAgents((items) => items.filter((item) => item !== agent)); }}>Delete</button></td></tr>)}</tbody></table>{agents.length === 0 && <p className="empty-state">No agents created yet.</p>}</div>{showCreate && <div className="modal-backdrop"><form className="crm-modal" onSubmit={addAgent}><button type="button" className="modal-close" onClick={() => setShowCreate(false)}>×</button><h3>Create Agent</h3><input required placeholder="Agent name" value={name} onChange={(event) => setName(event.target.value)} /><input required placeholder="10-digit mobile number" value={phone} onChange={(event) => { setPhone(event.target.value.replace(/\D/g, '').slice(0, 10)); setOtpVerified(false); }} /><input required placeholder="12-digit Aadhaar number" value={aadhaar} onChange={(event) => { setAadhaar(event.target.value.replace(/\D/g, '').slice(0, 12)); setOtpVerified(false); }} /><label>Sales Executive<select value={executive} onChange={(event) => setExecutive(event.target.value)}><option>Aliya</option><option>Keerthi</option></select></label><button type="button" className="table-action" onClick={sendOtp} disabled={!/^\d{12}$/.test(aadhaar) || !/^\d{10}$/.test(phone)}>Send OTP</button>{sentOtp && <><input required placeholder="Enter OTP" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} /><button type="button" className="table-action" onClick={() => setOtpVerified(otp === sentOtp)}>{otp === sentOtp ? 'OTP Verified' : 'Verify OTP'}</button></>}<button className="crm-primary" disabled={!otpVerified}>Create Agent</button></form></div>}</>;
}





































































































































